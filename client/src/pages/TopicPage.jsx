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

  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', url: '', description: '' });
  const [addingVideo, setAddingVideo] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const backendUrl = import.meta.env.VITE_API_URL || '';

  if (loading) return <LoadingSpinner size="lg" />;
  if (!topic) return <p className="text-center text-gray-500 py-12">Topic not found</p>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <Link
          to={`/subjects/${topic.subjectId?._id || topic.subjectId}`}
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-3"
        >
          <HiOutlineArrowLeft size={16} /> Back to {topic.subjectId?.title || 'Subject'}
        </Link>

        <h1 className="text-2xl font-bold text-gray-800">{topic.title}</h1>
      </div>

      {/* TABS */}
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
            </button>
          ))}
        </div>
      </div>

      {/* FILES TAB */}
      {activeTab === 'files' && (
        <div className="space-y-4">

          {isAdmin && (
            <div className="bg-white rounded-xl border border-gray-200 border-dashed p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />

              <HiOutlineUpload size={32} className="mx-auto text-gray-400" />

              <p className="text-sm text-gray-500 mt-2">
                PDF, DOC, Images, etc (max 50MB)
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </button>
            </div>
          )}

          {material?.files?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 divide-y">

              {material.files.map((file) => (
                <div key={file._id} className="flex justify-between items-center p-4">

                  <div>

                    <p className="font-medium text-gray-800">
                      {file.originalName}
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatSize(file.size)}
                    </p>

                    {/* Upload & update dates */}
                    <p className="text-xs text-gray-400">
                      Uploaded: {new Date(file.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    {material.updatedAt && (
                      <p className="text-xs text-gray-400">
                        Updated: {new Date(material.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}

                  </div>

                  <div className="flex gap-2">

                    <a
                      href={`${backendUrl}${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <HiOutlineDownload size={18} />
                    </a>

                    {isAdmin && (
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'file',
                            id: file._id,
                            name: file.originalName,
                          })
                        }
                        className="p-2 hover:bg-red-50 text-red-500 rounded"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    )}

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      )}

      {/* NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            {isAdmin ? (
              <>
                <ReactQuill
                  value={notes}
                  onChange={setNotes}
                  theme="snow"
                  placeholder="Write your notes here..."
                  className="bg-white"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    <HiOutlineSave size={16} />
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </>
            ) : notes ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: notes }}
              />
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">No notes available yet.</p>
            )}
          </div>
        </div>
      )}

      {/* VIDEOS TAB */}
      {activeTab === 'videos' && (
        <div className="space-y-4">

          {isAdmin && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              {!showVideoForm ? (
                <button
                  onClick={() => setShowVideoForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  <HiOutlinePlus size={16} />
                  Add Video
                </button>
              ) : (
                <form onSubmit={handleAddVideo} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                      placeholder="e.g. Algebra Lecture 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                    <input
                      type="url"
                      value={videoForm.url}
                      onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                    <textarea
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none"
                      placeholder="Brief description..."
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowVideoForm(false); setVideoForm({ title: '', url: '', description: '' }); }}
                      className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingVideo}
                      className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {addingVideo ? 'Adding...' : 'Add Video'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {material?.videos?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {material.videos.map((video) => {
                const embedUrl = getYouTubeEmbedUrl(video.url);
                return (
                  <div key={video._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {embedUrl && (
                      <div className="aspect-video">
                        <iframe
                          src={embedUrl}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-800 truncate">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Added: {new Date(video.addedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'video',
                                id: video._id,
                                name: video.title,
                              })
                            }
                            className="p-2 hover:bg-red-50 text-red-500 rounded ml-2 flex-shrink-0"
                          >
                            <HiOutlineTrash size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <HiOutlinePlay size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-500 mt-3">No videos added yet</p>
            </div>
          )}

        </div>
      )}

      {/* DELETE CONFIRM */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'file' ? 'File' : 'Video'}`}
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};

export default TopicPage;