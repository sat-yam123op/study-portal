import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HiOutlineSearch,
  HiOutlineBookOpen,
  HiOutlineFolder,
  HiOutlineDocumentText,
  HiOutlinePlay,
} from 'react-icons/hi';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
      setResults(res.data);
    } catch {
      setResults({ subjects: [], topics: [], materials: [] });
    } finally {
      setLoading(false);
    }
  };

  const totalResults =
    (results?.subjects?.length || 0) +
    (results?.topics?.length || 0) +
    (results?.materials?.length || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Search</h1>
        <p className="text-gray-500 text-sm mt-1">Find subjects, topics, notes, files, and videos</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <HiOutlineSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anything..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Results */}
      {loading && <LoadingSpinner />}

      {searched && !loading && results && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
          </p>

          {/* Subjects */}
          {results.subjects?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <HiOutlineBookOpen size={16} /> Subjects
              </h2>
              <div className="space-y-2">
                {results.subjects.map((s) => (
                  <Link
                    key={s._id}
                    to={`/subjects/${s._id}`}
                    className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm hover:border-indigo-200 transition"
                  >
                    <h3 className="font-medium text-gray-800">{s.title}</h3>
                    {s.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{s.description}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          {results.topics?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <HiOutlineFolder size={16} /> Topics
              </h2>
              <div className="space-y-2">
                {results.topics.map((t) => (
                  <Link
                    key={t._id}
                    to={`/topics/${t._id}`}
                    className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm hover:border-indigo-200 transition"
                  >
                    <h3 className="font-medium text-gray-800">{t.title}</h3>
                    {t.subjectId?.title && (
                      <p className="text-xs text-gray-400 mt-1">in {t.subjectId.title}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Materials (files/videos/notes) */}
          {results.materials?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <HiOutlineDocumentText size={16} /> Materials
              </h2>
              <div className="space-y-2">
                {results.materials.map((m) => (
                  <Link
                    key={m._id}
                    to={`/topics/${m.topicId?._id || m.topicId}`}
                    className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm hover:border-indigo-200 transition"
                  >
                    <h3 className="font-medium text-gray-800">
                      {m.topicId?.title || 'Material'}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {m.files?.filter((f) => new RegExp(query, 'i').test(f.originalName)).slice(0, 3).map((f) => (
                        <span key={f._id} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          <HiOutlineDocumentText size={12} /> {f.originalName}
                        </span>
                      ))}
                      {m.videos?.filter((v) => new RegExp(query, 'i').test(v.title)).slice(0, 3).map((v) => (
                        <span key={v._id} className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">
                          <HiOutlinePlay size={12} /> {v.title}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <HiOutlineSearch size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-500 mt-3">No results found for "{query}"</p>
              <p className="text-gray-400 text-sm mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
