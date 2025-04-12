'use server';

/**
 * Represents a Google Wave post.
 */
export interface WavePost {
  /**
   * The unique identifier of the wave post.
   */
  id: string;
  /**
   * The title of the wave post.
   */
  title: string;
  /**
   * The content of the wave post.
   */
  content: string;
  /**
   * The comments associated with the wave post.
   */
  comments: Record<string, any>;
}

/**
 * Represents a comment on a Google Wave post.
 */
export interface Comment {
  /**
   * The unique identifier of the comment.
   */
  id: string;
  /**
   * The author of the comment.
   */
  author: string;
  /**
   * The content of the comment.
   */
  text: string;
}

/**
 * Asynchronously fetches Google Wave post data from a JSON URL.
 *
 * @param url The URL of the JSON data.
 * @returns A promise that resolves to an array of WavePost objects.
 */
export async function fetchWavePosts(url: string): Promise<WavePost[]> {
  const wavePostsResponse = await fetch(url);
  const wavePostsJson = await wavePostsResponse.json();
  return wavePostsJson;
}

export async function fetchLocalComments(url: string) {
  const commentsResponse = await fetch(url);
  const commentsJson = await commentsResponse.json();
  return commentsJson;
}
