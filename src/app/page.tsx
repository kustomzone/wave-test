'use client';

import { fetchWavePosts, WavePost } from '@/services/wave-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import {summarizeWave} from "@/ai/flows/summarize-wave";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

async function getWavePosts(): Promise<WavePost[]> {
  // Replace with your actual JSON URL
  const wavePosts = await fetchWavePosts('https://example.com/wave-data.json');
  return wavePosts;
}

export default function Home() {
  const [wavePosts, setWavePosts] = useState<WavePost[]>([]);

  useEffect(() => {
    const loadWavePosts = async () => {
      const posts = await getWavePosts();
      setWavePosts(posts);
    };

    loadWavePosts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Wave Replicator</h1>
      <div className="grid gap-4">
        {wavePosts.map((post) => (
          <WavePostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}


interface WavePostCardProps {
    post: WavePost;
}

const WavePostCard: React.FC<WavePostCardProps> = ({post}) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.comments);

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
            setComments([...comments, newComment]);
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
                {comments.map((comment) => (
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


    