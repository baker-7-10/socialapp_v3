'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, MessageSquare, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Comment, PaginatedResponse } from '@/types';
import { commentsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';

interface CommentsSectionProps {
  postId: string;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮'];

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replyContentMap, setReplyContentMap] = useState<Record<string, string>>({});

  const fetchComments = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await commentsApi.list(postId, 20, p);
      const fetched = data.data as Comment[];
      if (p === 1) setComments(fetched);
      else setComments((prev) => [...prev, ...fetched]);
      try {
        await Promise.all(
          fetched.map(async (c) => {
            const res = await commentsApi.getReactions(c.id);
            setComments((prev) =>
              prev.map((pc) => (pc.id === c.id ? { ...pc, reactions: res.data } : pc))
            );
          })
        );
      } catch {
        // ignore reaction fetch errors
      }
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await commentsApi.create(postId, { content: content.trim() });
      setComments((prev) => [data as Comment, ...prev]);
      setContent('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentsApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const fetchReactions = async (commentId: string) => {
    try {
      const { data } = await commentsApi.getReactions(commentId);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, reactions: data } : c))
      );
    } catch {
      // ignore
    }
  };

  const handleReactToggle = async (
    commentId: string,
    emoji: string,
    reactedByMe: boolean | undefined
  ) => {
    try {
      if (reactedByMe) {
        await commentsApi.unreact(commentId, emoji);
      } else {
        await commentsApi.react(commentId, emoji);
      }
      await fetchReactions(commentId);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleReply = (commentId: string) => {
    setReplyOpen((s) => ({ ...s, [commentId]: !s[commentId] }));
  };

  const closeReply = (commentId: string) => {
    setReplyOpen((s) => ({ ...s, [commentId]: false }));
    setReplyContentMap((s) => ({ ...s, [commentId]: '' }));
  };

  const handleReplyChange = (commentId: string, value: string) => {
    setReplyContentMap((s) => ({ ...s, [commentId]: value }));
  };

  const submitReply = async (parentId: string) => {
    const body = (replyContentMap[parentId] || '').trim();
    if (!body) return;
    try {
      const { data } = await commentsApi.create(postId, { content: body, parentId });
      setComments((prev) => [data as Comment, ...prev]);
      closeReply(parentId);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="comments-section">
      {/* ── Composer ── */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5 mb-5">
        {user && (
          <Avatar
            src={user.avatarUrl}
            username={user.username}
            size="sm"
            className="flex-shrink-0"
          />
        )}
        <div
          className="flex flex-1 items-center rounded-full px-4 gap-1 transition-colors"
          style={{
            border: '0.5px solid var(--color-border-secondary)',
            background: 'var(--color-background-primary)',
          }}
          onFocusCapture={(e) =>
            ((e.currentTarget as HTMLDivElement).style.borderColor =
              'var(--color-border-primary)')
          }
          onBlurCapture={(e) =>
            ((e.currentTarget as HTMLDivElement).style.borderColor =
              'var(--color-border-secondary)')
          }
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 bg-transparent text-sm py-2 outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="p-1.5 rounded-full transition-colors flex-shrink-0"
            style={{
              color: content.trim()
                ? 'var(--color-text-primary)'
                : 'var(--color-text-tertiary)',
              background: content.trim()
                ? 'var(--color-background-secondary)'
                : 'transparent',
              cursor: content.trim() ? 'pointer' : 'default',
            }}
            aria-label="Post comment"
          >
            <Send size={13} />
          </button>
        </div>
      </form>

      <hr style={{ border: 'none', borderTop: '0.5px solid var(--color-border-tertiary)', marginBottom: '1.25rem' }} />

      {/* ── Loading skeleton ── */}
      {loading && page === 1 ? (
        <div className="space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-2.5">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5 pt-0.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        /* ── Empty state ── */
        <p
          className="text-sm text-center py-10"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          No comments yet — be the first!
        </p>
      ) : (
        /* ── Comment list ── */
        <div className="space-y-5">
          {comments.map((comment) => {
            const isOwner = user?.id === comment.authorId;

            return (
              <div key={comment.id} className="flex gap-2.5 group">
                <Avatar
                  src={comment.author.avatarUrl}
                  username={comment.author.username}
                  size="sm"
                  className="flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  {/* Meta row */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      @{comment.author.username}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>

                    {isOwner && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                        style={{ color: 'var(--color-text-danger)' }}
                        aria-label="Delete comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {comment.content}
                  </p>

                  {/* Actions: reactions + reply */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {REACTION_EMOJIS.map((emoji) => {
                      const reaction = comment.reactions?.find(
                        (r) => r.emoji === emoji
                      );
                      const active = !!reaction?.reactedByMe;
                      return (
                        <button
                          key={emoji}
                          onClick={() =>
                            handleReactToggle(
                              comment.id,
                              emoji,
                              reaction?.reactedByMe
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 transition-colors"
                          style={{
                            border: active
                              ? '0.5px solid var(--color-border-secondary)'
                              : '0.5px solid transparent',
                            background: active
                              ? 'var(--color-background-secondary)'
                              : 'transparent',
                            color: active
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-tertiary)',
                          }}
                        >
                          <span>{emoji}</span>
                          {reaction && reaction.count > 0 && (
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              {reaction.count}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Separator */}
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'inline-block',
                        width: 1,
                        height: 12,
                        background: 'var(--color-border-tertiary)',
                        margin: '0 4px',
                      }}
                    />

                    <button
                      onClick={() => toggleReply(comment.id)}
                      className="inline-flex items-center gap-1 text-xs rounded px-1.5 py-0.5 transition-colors"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          'var(--color-text-primary)';
                        (e.currentTarget as HTMLButtonElement).style.background =
                          'var(--color-background-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          'var(--color-text-tertiary)';
                        (e.currentTarget as HTMLButtonElement).style.background =
                          'transparent';
                      }}
                    >
                      <MessageSquare size={12} />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* Reply input */}
                  {replyOpen[comment.id] && (
                    <div className="mt-3 flex gap-2 items-start">
                      {user && (
                        <Avatar
                          src={user.avatarUrl}
                          username={user.username}
                          size="sm"
                          className="flex-shrink-0 mt-0.5"
                        />
                      )}
                      <div className="flex-1">
                        <div
                          className="flex items-center rounded-xl px-3 gap-1 transition-colors"
                          style={{
                            border: '0.5px solid var(--color-border-secondary)',
                            background: 'var(--color-background-primary)',
                          }}
                          onFocusCapture={(e) =>
                            ((e.currentTarget as HTMLDivElement).style.borderColor =
                              'var(--color-border-primary)')
                          }
                          onBlurCapture={(e) =>
                            ((e.currentTarget as HTMLDivElement).style.borderColor =
                              'var(--color-border-secondary)')
                          }
                        >
                          <input
                            type="text"
                            autoFocus
                            value={replyContentMap[comment.id] || ''}
                            onChange={(e) =>
                              handleReplyChange(comment.id, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') submitReply(comment.id);
                              if (e.key === 'Escape') closeReply(comment.id);
                            }}
                            placeholder={`Reply to @${comment.author.username}…`}
                            className="flex-1 bg-transparent text-sm py-2 outline-none"
                            style={{ color: 'var(--color-text-primary)' }}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() => submitReply(comment.id)}
                            disabled={!(replyContentMap[comment.id] || '').trim()}
                            className="text-xs font-medium px-3 py-1 rounded-md transition-colors"
                            style={{
                              border: '0.5px solid var(--color-border-primary)',
                              background: 'var(--color-background-primary)',
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => closeReply(comment.id)}
                            className="text-xs px-2 py-1 rounded-md transition-colors"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nested replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div
                      className="mt-3 pl-4 space-y-3"
                      style={{
                        borderLeft: '1.5px solid var(--color-border-tertiary)',
                      }}
                    >
                      {comment.replies.map((r) => (
                        <div key={r.id} className="flex gap-2">
                          <Avatar
                            src={r.author.avatarUrl}
                            username={r.author.username}
                            size="sm"
                            className="flex-shrink-0"
                            style={{ width: 26, height: 26, fontSize: 10 }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className="text-xs font-medium"
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                @{r.author.username}
                              </span>
                              <span
                                className="text-xs"
                                style={{ color: 'var(--color-text-tertiary)' }}
                              >
                                {formatDistanceToNow(new Date(r.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              {r.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Load more */}
          {page < totalPages && (
            <button
              onClick={() => {
                const next = page + 1;
                setPage(next);
                fetchComments(next);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-sm rounded-xl transition-colors"
              style={{
                border: '0.5px solid var(--color-border-tertiary)',
                background: 'var(--color-background-secondary)',
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  'var(--color-border-secondary)';
                (e.currentTarget as HTMLButtonElement).style.background =
                  'var(--color-background-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  'var(--color-border-tertiary)';
                (e.currentTarget as HTMLButtonElement).style.background =
                  'var(--color-background-secondary)';
              }}
            >
              <ChevronDown size={14} />
              Load more comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}