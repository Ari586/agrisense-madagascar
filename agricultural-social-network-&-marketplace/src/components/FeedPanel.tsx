import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Bookmark, Share2, Plus, X, Tag, Sparkles, 
  Send, UserCheck, Calendar, ArrowRight, RefreshCw, Languages 
} from 'lucide-react';
import { Post, Comment, Product } from '../types';

interface FeedPanelProps {
  posts: Post[];
  products: Product[];
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onCreatePost: (postData: { caption: string; images: string[]; hashtags: string[]; taggedProductId?: string }) => Promise<void>;
  onNavigateToProduct: (productId: string) => void;
  language: string;
}

export default function FeedPanel({
  posts,
  products,
  onLike,
  onSave,
  onAddComment,
  onCreatePost,
  onNavigateToProduct,
  language
}: FeedPanelProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [hashtagsText, setHashtagsText] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [translationText, setTranslationText] = useState<{[key: string]: string}>({});
  const [isTranslating, setIsTranslating] = useState<string | null>(null);

  // Fetch comments when selecting a post
  const handleSelectPost = async (post: Post) => {
    setSelectedPost(post);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      const data = await res.json();
      setPostComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostLike = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(postId);
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        likedByMe: !selectedPost.likedByMe,
        likesCount: selectedPost.likesCount + (selectedPost.likedByMe ? -1 : 1)
      });
    }
  };

  const handlePostSave = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(postId);
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        savedByMe: !selectedPost.savedByMe,
        savedCount: selectedPost.savedCount + (selectedPost.savedByMe ? -1 : 1)
      });
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPost) return;

    await onAddComment(selectedPost.id, newCommentText);
    
    // Refresh comments locally
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}/comments`);
      const data = await res.json();
      setPostComments(data);
      setNewCommentText('');
      
      // Update selectedPost comment count
      setSelectedPost({
        ...selectedPost,
        commentsCount: selectedPost.commentsCount + 1
      });
    } catch (err) {
      console.error(err);
    }
  };

  // AI caption enhancement using Gemini API
  const handleAIEnhance = async () => {
    if (!caption.trim()) return;
    setIsEnhancing(true);
    try {
      const parsedTags = hashtagsText.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/ai/enhance-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, hashtags: parsedTags }),
      });
      const data = await res.json();
      if (data.enhancedCaption) {
        setCaption(data.enhancedCaption);
      }
      if (data.hashtags && data.hashtags.length > 0) {
        setHashtagsText(data.hashtags.join(', '));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Translate caption to selected language using Gemini API
  const handleTranslatePost = async (postId: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (translationText[postId]) {
      // Toggle off translation if already loaded
      const updated = { ...translationText };
      delete updated[postId];
      setTranslationText(updated);
      return;
    }

    setIsTranslating(postId);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: language }),
      });
      const data = await res.json();
      if (data.translatedText) {
        setTranslationText(prev => ({ ...prev, [postId]: data.translatedText }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(null);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    const parsedTags = hashtagsText.split(',').map(t => t.trim().replace('#', '')).filter(Boolean);
    const parsedImages = imagesText.split('\n').map(img => img.trim()).filter(Boolean);

    await onCreatePost({
      caption,
      images: parsedImages,
      hashtags: parsedTags,
      taggedProductId: selectedProduct || undefined
    });

    setCaption('');
    setSelectedProduct('');
    setHashtagsText('');
    setImagesText('');
    setIsCreating(false);
  };

  return (
    <div className="w-full" id="feed-panel">
      
      {/* Feed Sub-Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
            📱 Community Feed
          </h2>
          <p className="text-xs text-gray-500">Discover farming techniques, field logs, and crop trades globally</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-xs font-bold text-white shadow-md shadow-red-100"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Xiaohongshu-style Multi-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => handleSelectPost(post)}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all flex flex-col h-full"
          >
            {/* Post Media */}
            <div className="relative aspect-5/4 bg-gray-50 overflow-hidden">
              <img
                src={post.images[0]}
                alt="Post Media"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {post.taggedProductId && (
                <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[10px] text-white font-bold tracking-tight">
                  <Tag className="w-3 h-3 text-red-400" />
                  <span>{post.taggedProductTitle}</span>
                </div>
              )}
            </div>

            {/* Post Description */}
            <div className="p-3.5 flex flex-col flex-1 text-left">
              <p className="text-xs text-gray-800 line-clamp-3 leading-relaxed mb-3 font-medium">
                {translationText[post.id] ? (
                  <span className="text-rose-600 bg-rose-50/50 p-1 rounded-sm block text-[11px] border border-rose-100">
                    🌐 [Translated]: {translationText[post.id]}
                  </span>
                ) : post.caption}
              </p>

              {/* Hashtags */}
              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.hashtags.map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-50 text-red-500 font-bold px-1.5 py-0.5 rounded-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer: User Details + Interaction Buttons */}
              <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-800 leading-tight truncate max-w-[90px]">{post.userName}</span>
                    <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold font-mono">{post.userRole}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Translate Button */}
                  <button 
                    onClick={(e) => handleTranslatePost(post.id, post.caption, e)}
                    title="AI Translate to your language"
                    className={`p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors ${isTranslating === post.id ? 'animate-spin text-red-500' : ''}`}
                  >
                    <Languages className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handlePostLike(post.id, e)}
                    className={`flex items-center gap-0.5 text-[11px] font-bold transition-colors ${
                      post.likedByMe ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.likedByMe ? 'fill-red-500' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={(e) => handlePostSave(post.id, e)}
                    className={`flex items-center gap-0.5 text-[11px] font-bold transition-colors ${
                      post.savedByMe ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${post.savedByMe ? 'fill-amber-500' : ''}`} />
                    <span>{post.savedCount}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ----------------- CREATE POST DIALOG ----------------- */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5 uppercase font-mono">
                ✍️ Publish Crop Log / Post
              </h3>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitPost} className="p-5 space-y-4">
              {/* Caption Draft */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-extrabold uppercase font-mono text-gray-500 flex items-center justify-between">
                  <span>Describe harvest details, trade trends or advice:</span>
                  <button
                    type="button"
                    onClick={handleAIEnhance}
                    disabled={isEnhancing || !caption.trim()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-[10px] text-red-600 font-bold border border-red-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isEnhancing ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Enhancing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-red-500 animate-pulse" />
                        <span>RED Style AI Polish</span>
                      </>
                    )}
                  </button>
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Just harvested delicious, sun-dried Senegalese ginger rhizomes..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all resize-none"
                  required
                />
              </div>

              {/* Tag / Link to active product */}
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-extrabold uppercase font-mono text-gray-500 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Tag One of Your Marketplace Product Listings (Optional):</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-hidden focus:border-red-500"
                >
                  <option value="">-- Do Not Tag Any Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (${p.price}/{p.unit})</option>
                  ))}
                </select>
              </div>

              {/* Hashtags input */}
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-extrabold uppercase font-mono text-gray-500">
                  Hashtags (separated by comma):
                </label>
                <input
                  type="text"
                  value={hashtagsText}
                  onChange={(e) => setHashtagsText(e.target.value)}
                  placeholder="e.g. OrganicCoffee, SunDried, WheatExport"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden focus:border-red-500"
                />
              </div>

              {/* Images URL input */}
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-extrabold uppercase font-mono text-gray-500">
                  Photo URLs (one per line, optional):
                </label>
                <textarea
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  placeholder="Paste Unsplash or direct image URLs..."
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-md shadow-red-100 transition-colors"
                >
                  Publish Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- POST DETAIL DIALOG (Xiaohongshu Slide-over Style) ----------------- */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left/Top Column: Post Images */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative min-h-[300px] max-h-[450px] md:max-h-[none]">
              <img
                src={selectedPost.images[0]}
                alt="Post Full Resolution"
                className="w-full h-full object-cover max-h-[450px] md:max-h-full"
              />
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 left-4 bg-black/40 hover:bg-black/70 p-1.5 rounded-full text-white transition-colors block md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Right/Bottom Column: Interactions, Details, Comments */}
            <div className="w-full md:w-1/2 p-5 md:p-6 flex flex-col max-h-[50vh] md:max-h-full overflow-y-auto text-left">
              
              {/* Header: User Profile */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedPost.userAvatar}
                    alt={selectedPost.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-black text-gray-900 leading-tight">{selectedPost.userName}</h4>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 font-mono">{selectedPost.userRole}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors hidden md:block"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Main Content Area */}
              <div className="py-4 space-y-4 flex-1">
                {/* Caption */}
                <p className="text-xs text-gray-800 leading-relaxed font-medium">
                  {selectedPost.caption}
                </p>

                {/* Hashtags */}
                {selectedPost.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPost.hashtags.map(tag => (
                      <span key={tag} className="text-[10px] bg-red-50 text-red-500 font-extrabold px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tagged Product Link (Call to Action!) */}
                {selectedPost.taggedProductId && (
                  <div className="bg-red-50/50 rounded-xl p-3 border border-red-100/60 flex items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-red-500 tracking-wider uppercase block font-mono">Linked Trade Product</span>
                        <span className="text-xs font-bold text-gray-800 line-clamp-1">{selectedPost.taggedProductTitle}</span>
                        {selectedPost.taggedProductPrice && (
                          <span className="text-xs font-extrabold text-red-500">${selectedPost.taggedProductPrice}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onNavigateToProduct(selectedPost.taggedProductId!);
                        setSelectedPost(null);
                      }}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-full text-[10px] font-black text-white flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <span>Buy Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-3.5 pt-3 border-t border-gray-50">
                  <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">
                    💬 Comments & Responses ({postComments.length})
                  </h5>
                  {postComments.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic">No comments filed yet. Start the trade inquiry!</p>
                  ) : (
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                      {postComments.map((comment) => (
                        <div key={comment.id} className="flex gap-2.5 text-left">
                          <img
                            src={comment.userAvatar}
                            alt={comment.userName}
                            className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                          />
                          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] font-bold text-gray-800">{comment.userName}</span>
                              <span className="text-[8px] text-gray-400 font-mono">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-gray-600">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form to Post Comment */}
              <form onSubmit={handleSendComment} className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Post an agricultural inquiry or feedback..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden focus:border-red-400 focus:bg-white"
                  required
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
