import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineFolder,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArrowLeft,
} from 'react-icons/hi';

const SubjectDetailPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit
  const [editTopic, setEditTopic] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [subRes, topRes] = await Promise.all([
        api.get(`/subjects/${id}`),
        api.get(`/topics?subjectId=${id}`),
      ]);
      setSubject(subRes.data);
      setTopics(topRes.data);
    } catch {
      toast.error('Failed to load subject');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/topics', { title: newTitle, subjectId: id });
      toast.success('Topic created!');
      setShowCreate(false);
      setNewTitle('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create topic');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/topics/${editTopic._id}`, { title: editTitle });
      toast.success('Topic renamed!');
      setEditTopic(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/topics/${deleteTarget._id}`);
      toast.success('Topic deleted');
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!subject) return <p className="text-center text-gray-500 py-12">Subject not found</p>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Header */}
      <div>
        <Link to="/subjects" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-3">
          <HiOutlineArrowLeft size={16} /> Back to Subjects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{subject.title}</h1>
            {subject.description && (
              <p className="text-gray-500 text-sm mt-1">{subject.description}</p>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              <HiOutlinePlus size={18} />
              Add Topic
            </button>
          )}
        </div>
      </div>

      {/* Topics List */}
      {topics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <HiOutlineFolder size={48} className="mx-auto text-gray-300" />
          <p className="text-gray-500 mt-3">No topics yet</p>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)} className="mt-4 text-indigo-600 text-sm font-medium hover:underline">
              Add the first topic
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <div
              key={topic._id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition group relative"
            >
              <Link to={`/topics/${topic._id}`} className="block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <HiOutlineFolder size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => { setEditTopic(topic); setEditTitle(topic.title); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    title="Rename"
                  >
                    <HiOutlinePencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(topic)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                    title="Delete"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Topic</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  placeholder="e.g. Chapter 1 - Introduction"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rename Topic</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditTopic(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Topic"
        message={`Delete "${deleteTarget?.title}"? All notes, files, and videos inside will be removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default SubjectDetailPage;
