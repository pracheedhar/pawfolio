import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { api, mediaUrl } from '../lib/api';
import { useResource } from '../lib/useResource';
import DataState from '../components/DataState';

export default function ProfileFeed() {
  const { user, setUser, notify } = useAppContext();
  const posts = useResource('/posts?limit=100');
  const bookings = useResource('/bookings?limit=100');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const perform = async (task) => {
    if (busy) return;
    setBusy(true);
    try {
      await task();
    } catch (error) {
      notify(error.message);
    } finally {
      setBusy(false);
    }
  };
  const saveProfile = (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    perform(async () => {
      setUser(await api('/users/me', { method: 'PATCH', body }));
      setEditing(false);
      notify('Profile updated');
    });
  };
  const uploadPost = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const image = data.get('image');
    if (image.size > 5 * 1024 * 1024) {
      notify('Choose an image smaller than 5 MB');
      return;
    }
    perform(async () => {
      const upload = new FormData();
      upload.append('image', data.get('image'));
      const file = await api('/uploads', { method: 'POST', body: upload });
      try {
        await api('/posts', {
          method: 'POST',
          body: { image: file.url, caption: data.get('caption') },
        });
      } catch (error) {
        await api(`/uploads/${file.id}`, { method: 'DELETE' });
        throw error;
      }
      form.reset();
      posts.reload();
      notify('Post shared');
    });
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-4rem)] w-full py-12 bg-white"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start mb-12 gap-8 md:gap-16">
          <img
            src={mediaUrl(user.avatar) || '/favicon.svg'}
            alt="Profile Avatar"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#E6F0F9]"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-black mb-4">{user.name}</h2>
            <div className="flex justify-center md:justify-start space-x-8 mb-6">
              {[
                [posts.data?.total || 0, 'Posts'],
                [user.followers?.length || 0, 'Followers'],
                [user.following?.length || 0, 'Following'],
              ].map(([count, label]) => (
                <div key={label} className="text-center">
                  <span className="block font-bold text-xl">{count}</span>
                  <span className="text-gray-500">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600">{user.bio}</p>
            <button onClick={() => setEditing(!editing)} className="mt-4 text-[#587ea8]">
              Edit profile
            </button>
          </div>
        </div>
        {editing && (
          <form onSubmit={saveProfile} className="rounded-xl bg-[#E6F0F9] p-6 mb-8 space-y-3">
            <label className="block">
              Name
              <input
                name="name"
                defaultValue={user.name}
                required
                minLength={2}
                maxLength={80}
                className="block border rounded p-2 w-full"
              />
            </label>
            <label className="block">
              Avatar URL
              <input
                name="avatar"
                type="url"
                defaultValue={user.avatar}
                placeholder="https://…"
                className="block border rounded p-2 w-full"
              />
            </label>
            <label className="block">
              Bio
              <textarea
                name="bio"
                defaultValue={user.bio}
                maxLength={500}
                className="block border rounded p-2 w-full"
              />
            </label>
            <button disabled={busy} className="rounded-full bg-[#6A92C5] text-white px-6 py-2">
              Save profile
            </button>
          </form>
        )}
        <hr className="border-gray-200 mb-8" />
        <form onSubmit={uploadPost} className="rounded-xl bg-[#E6F0F9] p-6 mb-8 space-y-3">
          <label className="block">
            Share a pet photo
            <input
              aria-label="Post image"
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              required
              className="block mt-2"
            />
          </label>
          <label className="block">
            Caption
            <input name="caption" maxLength={2000} className="border rounded p-2 w-full" />
          </label>
          <button disabled={busy} className="rounded-full bg-[#6A92C5] text-white px-6 py-2">
            {busy ? 'Please wait…' : 'Share post'}
          </button>
        </form>
        <DataState
          loading={posts.loading}
          error={posts.error}
          empty={!posts.data?.items.length}
          retry={posts.reload}
        />
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {posts.data?.items.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100 group">
                <img
                  src={mediaUrl(post.image)}
                  alt={post.caption || 'Pet post'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <button
                  disabled={busy}
                  aria-label="Toggle like"
                  onClick={() =>
                    perform(async () => {
                      await api(`/posts/${post.id}/like`, { method: 'POST', body: {} });
                      posts.reload();
                    })
                  }
                  className="absolute bottom-2 left-2 rounded-full bg-black/50 text-white px-2"
                >
                  ❤️ {post.likes.length}
                </button>
              </div>
              <p className="text-sm text-gray-600 truncate">{post.caption}</p>
              <button
                disabled={busy}
                className="text-xs text-[#587ea8] mr-3"
                onClick={() => {
                  const caption = window.prompt('Edit caption', post.caption);
                  if (caption !== null && caption.length <= 2000)
                    perform(async () => {
                      await api(`/posts/${post.id}`, { method: 'PATCH', body: { caption } });
                      posts.reload();
                      notify('Post updated');
                    });
                }}
              >
                Edit
              </button>
              <button
                disabled={busy}
                className="text-xs text-red-600"
                onClick={() => {
                  if (window.confirm('Delete this post?'))
                    perform(async () => {
                      await api(`/posts/${post.id}`, { method: 'DELETE' });
                      posts.reload();
                      notify('Post deleted');
                    });
                }}
              >
                Delete
              </button>
            </motion.div>
          ))}
        </div>
        <h3 className="text-2xl font-bold mt-12 mb-4">Your bookings</h3>
        <DataState
          loading={bookings.loading}
          error={bookings.error}
          empty={!bookings.data?.items.length}
          retry={bookings.reload}
        />
        {bookings.data?.items.map((booking) => (
          <div
            key={booking.id}
            className="border rounded-xl p-4 mb-3 flex flex-wrap gap-4 items-center"
          >
            <p>
              {booking.date} · {booking.time} · {booking.status}
            </p>
            {booking.status === 'pending' && (
              <Link to={`/payment/${booking.id}`} className="text-[#587ea8]">
                Complete demo confirmation
              </Link>
            )}
            {booking.status !== 'cancelled' && (
              <button
                disabled={busy}
                className="text-red-600"
                onClick={() =>
                  perform(async () => {
                    await api(`/bookings/${booking.id}`, {
                      method: 'PATCH',
                      body: { status: 'cancelled' },
                    });
                    bookings.reload();
                    notify('Booking cancelled');
                  })
                }
              >
                Cancel
              </button>
            )}
            {booking.status === 'cancelled' && (
              <button
                disabled={busy}
                className="text-red-600"
                onClick={() =>
                  perform(async () => {
                    await api(`/bookings/${booking.id}`, { method: 'DELETE' });
                    bookings.reload();
                    notify('Booking deleted');
                  })
                }
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
