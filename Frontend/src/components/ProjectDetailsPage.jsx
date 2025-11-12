import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/project/${id}`);
      setProject(res.data);
    } catch (err) {
      setError('Failed to load project.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line
  }, [id]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/project/${id}/bid`, { amount: parseFloat(bidAmount), proposal: bidProposal });
      setBidAmount('');
      setBidProposal('');
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to place bid.');
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await axios.post(`/project/${id}/accept_bid`, { bid_id: bidId });
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to accept bid.');
    }
  };

  if (loading) return <div className="container mx-auto py-8 px-4">Loading project details...</div>;
  if (error) return <div className="container mx-auto py-8 px-4 text-red-500">{error}</div>;
  if (!project) return null;

  const userHasBid = project.bids.some(b => b.freelancer.id === user?.id);
  const isClient = user?.id === project.client.id;
  const isFreelancer = user?.is_freelancer;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="card p-8">
        <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-4 ${
          project.status === 'open' ? 'bg-green-100 text-green-800' :
            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
        }`}>{project.status}</span>

        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <p className="text-gray-600 text-sm mb-4">Client: {project.client.username}</p>
        <p className="text-2xl font-bold text-gray-900 mb-6">Budget: ${Number(project.budget).toLocaleString()}</p>
        <div className="prose max-w-none"><p>{project.description}</p></div>
      </div>

      <div className="card p-8 mt-8">
        <h2 className="text-2xl font-bold mb-6">Bids ({project.bids.length})</h2>
        <div className="space-y-4">
          {project.bids.length === 0 ? <p>No bids placed yet.</p> : project.bids.map(bid => (
            <div key={bid.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{bid.freelancer.username}</p>
                  <p className="text-xl font-bold text-indigo-600">${Number(bid.amount).toLocaleString()}</p>
                </div>
                {isClient && project.status === 'open' && (
                  <button onClick={() => handleAcceptBid(bid.id)} className="px-3 py-1 bg-indigo-600 text-white rounded">Accept Bid</button>
                )}
              </div>
              <p className="mt-4 text-gray-700">{bid.proposal}</p>
            </div>
          ))}
        </div>
      </div>

      {isAuthenticated && isFreelancer && project.status === 'open' && !userHasBid && (
        <div className="card p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">Place Your Bid</h2>
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Your Bid Amount ($)</label>
              <input type="number" className="form-input w-full" value={bidAmount} onChange={e => setBidAmount(e.target.value)} required min="1" />
            </div>
            <div>
              <label className="block text-sm mb-1">Proposal</label>
              <textarea className="form-input w-full" rows="5" value={bidProposal} onChange={e => setBidProposal(e.target.value)} required />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Submit Bid</button>
          </form>
        </div>
      )}

      {isAuthenticated && isFreelancer && userHasBid && (
        <p className="text-center mt-8 text-lg font-semibold text-gray-700">You have already placed a bid on this project.</p>
      )}
    </div>
  );
}
