import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentText,
  HiOutlineUpload,
  HiOutlinePlay,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlineSave,
  HiOutlinePlus,
} from 'react-icons/hi';

const TABS = [
  { key: 'notes', label: 'Notes', icon: <HiOutlineDocumentText size={18} /> },
  { key: 'files', label: 'Files', icon: <HiOutlineUpload size={18} /> },
  { key: 'videos', label: 'Videos', icon: <HiOutlinePlay size={18} /> },
];

// ─── Helper: Extract YouTube embed URL ───
const getYouTubeEmbedUrl = (url) => {
  try {
    let videoId = '';
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    } else {
      videoId = urlObj.searchParams.get('v');
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
};

const TopicPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const fileInputRef = useRef(null);

  const [topic, setTopic] = useState(null);
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');

  // Notes
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // File upload
  const [uploading, setUploading] = useState(false);

  // Video form
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', url: '', description: '' });
  const [addingVideo, setAddingVideo] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'file'|'video', id, name }

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [topicRes, matRes] = await Promise.all([
        api.get(`/topics/${id}`),
        api.get(`/materials/${id}`),
      ]);
      setTopic(topicRes.data);
      setMaterial(matRes.data);
      setNotes(matRes.data.notes || '');
    } catch {
      toast.error('Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  // ─── Notes ───
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.put(`/materials/${id}/notes`, { notes });
      toast.success('Notes saved!');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // ─── File Upload ───
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/materials/${id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMaterial(res.data);
      toast.success('File uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Delete file/video ───
  const handleDelete = async () => {
    try {
      if (deleteTarget.type === 'file') {
        const res = await api.delete(`/materials/${id}/files/${deleteTarget.id}`);
        setMaterial(res.data.material);
      } else {
        const res = await api.delete(`/materials/${id}/videos/${deleteTarget.id}`);
        setMaterial(res.data.material);
      }
      toast.success(`${deleteTarget.type === 'file' ? 'File' : 'Video'} deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ─── Add Video ───
  const handleAddVideo = async (e) => {
    e.preventDefault();
    setAddingVideo(true);
    try {
      const res = await api.post(`/materials/${id}/videos`, videoForm);
      setMaterial(res.data);
      toast.success('Video added!');
      setShowVideoForm(false);
      setVideoForm({ title: '', url: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add video');
    } finally {
      setAddingVideo(false);
    }
  };

  // ─── File size formatter ───
  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // ─── Backend base URL for file downloads ───
  const backendUrl = import.meta.env.VITE_API_URL || '';

  if (loading) return <LoadingSpinner size="lg" />;
  if (!topic) return <p className="text-center text-gray-500 py-12">Topic not found</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/subjects/${topic.subjectId?._id || topic.subjectId}`}
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-3"
        >
          <HiOutlineArrowLeft size={16} /> Back to {topic.subjectId?.title || 'Subject'}
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{topic.title}</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.key === 'files' && material?.files?.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-xs">{material.files.length}</span>
              )}
              {tab.key === 'videos' && material?.videos?.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-xs">{material.videos.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ NOTES TAB ═══════════ */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {isAdmin ? (
            <>
              <ReactQuill
                theme="snow"
                value={notes}
                onChange={setNotes}
                placeholder="Write your notes here..."
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['blockquote', 'code-block'],
                    ['link', 'image'],
                    ['clean'],
                  ],
                }}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <HiOutlineSave size={18} />
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </>
          ) : (
            <div>
              {notes ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: notes }}
                />
              ) : (
                <p className="text-gray-400 text-center py-8">No notes available yet</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ FILES TAB ═══════════ */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="bg-white rounded-xl border border-gray-200 border-dashed p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
              />
              <HiOutlineUpload size={32} className="mx-auto text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">PDF, DOC, Images, etc (max 50MB)</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </button>
            </div>
          )}

          {material?.files?.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {material.files.map((file) => (
                <div key={file._id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <HiOutlineDocumentText size={18} className="text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{file.originalName}</p>
                      <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a
                      href={`${backendUrl}${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                      title="Download"
                    >
                      <HiOutlineDownload size={18} />
                    </a>
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteTarget({ type: 'file', id: file._id, name: file.originalName })}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                        title="Delete"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isAdmin && <p className="text-center text-gray-400 py-8">No files uploaded yet</p>
          )}
        </div>
      )}

      {/* ═══════════ VIDEOS TAB ═══════════ */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          {isAdmin && (
            <div>
              {!showVideoForm ? (
                <button
                  onClick={() => setShowVideoForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  <HiOutlinePlus size={18} /> Add YouTube Video
                </button>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Add YouTube Video</h3>
                  <form onSubmit={handleAddVideo} className="space-y-3">
                    <input
                      type="text"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      required
                      placeholder="Video title"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    />
                    <input
                      type="url"
                      value={videoForm.url}
                      onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    />
                    <textarea
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none"
                    />
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setShowVideoForm(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="submit" disabled={addingVideo} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                        {addingVideo ? 'Adding...' : 'Add Video'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {material?.videos?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {material.videos.map((video) => {
                const embedUrl = getYouTubeEmbedUrl(video.url);
                return (
                  <div key={video._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {embedUrl ? (
                      <div className="aspect-video">
                        <iframe
                          src={embedUrl}
                          title={video.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">Invalid URL</p>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-gray-800">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-gray-500 mt-1">{video.description}</p>
                          )}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget({ type: 'video', id: video._id, name: video.title })}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 flex-shrink-0"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No videos added yet</p>
          )}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'file' ? 'File' : 'Video'}`}
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default TopicPage;
