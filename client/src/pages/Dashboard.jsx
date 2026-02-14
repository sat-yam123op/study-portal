import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineBookOpen, HiOutlineSpeakerphone } from 'react-icons/hi';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for creating subject
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  // Modal for announcements
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, annRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/announcements'),
      ]);
      setSubjects(subRes.data);
      setAnnouncements(annRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/subjects', newSubject);
      toast.success('Subject created!');
      setShowCreateSubject(false);
      setNewSubject({ title: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/announcements', newAnnouncement);
      toast.success('Announcement posted!');
      setShowCreateAnnouncement(false);
      setNewAnnouncement({ title: '', message: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'Manage your study portal' : 'Browse study materials'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateSubject(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              <HiOutlinePlus size={18} />
              New Subject
            </button>
            <button
              onClick={() => setShowCreateAnnouncement(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              <HiOutlineSpeakerphone size={18} />
              Announce
            </button>
          </div>
        )}
      </div>

      {/* Announcements Panel */}
      {announcements.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-amber-800 flex items-center gap-2 mb-3">
            <HiOutlineSpeakerphone size={20} />
            Announcements
          </h2>
          <div className="space-y-3">
            {announcements.slice(0, 5).map((ann) => (
              <div key={ann._id} className="bg-white rounded-lg p-4 border border-amber-100">
                <h3 className="font-medium text-gray-800">{ann.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{ann.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(ann.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                  {ann.createdBy && ` · by ${ann.createdBy.name}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <HiOutlineBookOpen size={20} />
          Subjects ({subjects.length})
        </h2>
        {subjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <HiOutlineBookOpen size={48} className="mx-auto text-gray-300" />
            <p className="text-gray-500 mt-3">No subjects yet</p>
            {isAdmin && (
              <button
                onClick={() => setShowCreateSubject(true)}
                className="mt-4 text-indigo-600 text-sm font-medium hover:underline"
              >
                Create your first subject
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <Link
                key={subject._id}
                to={`/subjects/${subject._id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition group"
              >
                <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                  {subject.title}
                </h3>
                {subject.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{subject.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Created {new Date(subject.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ─── Create Subject Modal ─── */}
      {showCreateSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newSubject.title}
                  onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none"
                  placeholder="Brief description..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateSubject(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Create Announcement Modal ─── */}
      {showCreateAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Post Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none"
                  placeholder="Write your announcement..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateAnnouncement(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creating ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
