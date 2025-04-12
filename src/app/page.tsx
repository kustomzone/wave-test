'use client';

import { fetchWavePosts, WavePost, fetchLocalComments } from '@/services/wave-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useCallback } from 'react';
import {summarizeWave} from "@/ai/flows/summarize-wave";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/theme-toggle';
import {Comment} from "@/services/wave-data";


async function getWavePosts(): Promise<WavePost[]> {
  const wavePosts = await fetchWavePosts('/wave-data.json');
  return wavePosts;
}

export default function Home() {
  const [wavePosts, setWavePosts] = useState<WavePost[]>([]);
  const [comments, setComments] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const loadWavePosts = async () => {
      const posts = await getWavePosts();
      setWavePosts(posts);
    };

    loadWavePosts();
  }, []);

  useEffect(() => {
    const loadComments = async () => {
      const fetchedComments = await fetchLocalComments('/comments.json');
      setComments(fetchedComments.comments);
    };

    loadComments();
  }, []);

  const getCommentText = (commentId: string) => {
    if (!comments) return 'Loading...';
    if (!comments[commentId]) return 'Comment not found';

    const comment = Object.values(comments[commentId])[0] as any;
    return comment?.object?.content || 'No comment content';
  };

  const getCommentAuthor = (commentId: string) => {
    if (!comments) return 'Loading...';
    if (!comments[commentId]) return 'Comment not found';

    const comment = Object.values(comments[commentId])[0] as any;
    return comment?.actor?.displayName || 'Unknown Author';
  };

    const fetchLocalCommentsFromFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            console.log("No file selected");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                try {
                    const json = JSON.parse(text);
                    setComments(json.comments);
                } catch (e) {
                    console.error("Error parsing JSON", e);
                    alert("Failed to parse JSON from file.");
                }
            }
        };
        reader.readAsText(file);
    }, [setComments]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Wave Replicator</h1>
        <ThemeToggle />
      </div>
        <input
            type="file"
            id="commentFile"
            name="commentFile"
            accept=".json"
            onChange={fetchLocalCommentsFromFile}
        />
      <div className="grid gap-4">
        {wavePosts.map((post) => (
          <WavePostCard
            key={post.id}
            post={post}
            getCommentText={getCommentText}
            getCommentAuthor={getCommentAuthor}
          />
        ))}
      </div>
    </div>
  );
}

interface WavePostCardProps {
    post: WavePost;
    getCommentText: (commentId: string) => string;
    getCommentAuthor: (commentId: string) => string;
}

const WavePostCard: React.FC<WavePostCardProps> = ({ post, getCommentText, getCommentAuthor }) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState<Comment[]>([]);

    useEffect(() => {
      if (post.comments) {
          const initialComments: Comment[] = Object.keys(post.comments).map(key => {
              const comment = Object.values(post.comments[key])[0] as any;
              return {
                  id: comment.id,
                  author: comment.actor.displayName,
                  text: comment.object.content,
              };
          });
          setLocalComments(initialComments);
      }
  }, [post.comments]);

    const handleSummarize = async () => {
        setIsSummarizing(true);
        try {
            const result = await summarizeWave({ waveContent: post.content });
            setSummary(result.summary);
        } catch (error) {
            console.error("Failed to summarize wave:", error);
            setSummary("Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleAddComment = () => {
        if (commentText.trim() !== '') {
            const newComment = {
                id: Date.now().toString(),
                author: 'CurrentUser', // Replace with actual user
                text: commentText,
            };
            setLocalComments([...localComments, newComment]);
            setCommentText(''); // Clear the input
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                    {summary ? (
                        <>
                            {summary}
                        </>
                    ) : (
                        <>
                            {isSummarizing ? 'Summarizing...' : null}
                            <Button disabled={isSummarizing} onClick={handleSummarize} size="sm">
                                Summarize
                            </Button>
                        </>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>{post.content}</p>
                <h3 className="text-lg font-semibold mt-2">Comments</h3>
                {localComments.map((comment) => (
                    <div key={comment.id} className="mb-2">
                        <p className="font-bold">{comment.author}:</p>
                        <p>{comment.text}</p>
                    </div>
                ))}
                <div className="mt-4">
                    <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                    />
                    <Button onClick={handleAddComment} className="mt-2">
                        Add Comment
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
