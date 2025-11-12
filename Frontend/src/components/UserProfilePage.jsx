import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');

  const isCurrentUser = currentUser?.id === parseInt(id, 10);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/user/${id}`);
      setProfile(res.data);
      setEditBio(res.data.bio || '');
      setEditSkills(res.data.skills || '');
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/user/profile', { bio: editBio, skills: editSkills });
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  if (loading) return <div className="container mx-auto py-8 px-4">Loading profile...</div>;
  if (error) return <div className="container mx-auto py-8 px-4 text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="card p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            <p className="text-lg text-indigo-600">{profile.is_freelancer ? 'Freelancer' : 'Client'}</p>
            {profile.is_freelancer && <p className="text-2xl font-bold mt-2">Rating: {Number(profile.ranking_score).toFixed(1)} / 5.0</p>}
          </div>

          {isCurrentUser && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="px-3 py-1 border rounded">Edit Profile</button>
          )}
        </div>

        <hr className="my-6" />

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">Bio</h3>
              <p className="text-gray-700">{profile.bio || 'No bio provided.'}</p>
            </div>
            {profile.is_freelancer && (
              <div>
                <h3 className="text-xl font-semibold">Skills</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(profile.skills ? profile.skills.split(',') : []).map((skill, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">{skill.trim()}</span>
                  ))}
                  {!profile.skills && <p className="text-gray-700">No skills listed.</p>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Bio</label>
              <textarea className="form-input w-full" rows="4" value={editBio} onChange={e => setEditBio(e.target.value)} />
            </div>
            {profile.is_freelancer && (
              <div>
                <label className="block text-sm mb-1">Skills (comma-separated)</label>
                <input type="text" className="form-input w-full" value={editSkills} onChange={e => setEditSkills(e.target.value)} />
              </div>
            )}
            <div className="flex space-x-4">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="card p-8 mt-8">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        <div className="space-y-4">
          {profile.reviews_received.length === 0 ? <p>No reviews received yet.</p> : profile.reviews_received.map(review => (
            <div key={review.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{review.reviewer.username}</span>
                <span className="text-lg font-bold text-yellow-500">{review.rating} / 5 ★</span>
              </div>
              <p className="mt-2 text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
