import PageLayout from '@/components/layout/pageLayout';
import { useAuthStore } from '@/store/authStore';
import { Camera, Edit, Lock, Globe, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getMyUserProfile, changeUserIcon } from '@/api123/Auth-User.API';
import { getUserPosts } from '@/api123/Posts.API';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import PostItem from '@/components/PostItem';

export default function Profile() {
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const setUser = useAuthStore((state) => state.setUser);
  const updateUser = useAuthStore((state) => state.updateUserIcon);
  const user = useAuthStore((state) => state.user);

  // ─── Load profile data ─────────────────────────────────────────────────
  const { data: profileData } = useQuery({
    queryKey: ['user'],
    queryFn: getMyUserProfile,
  });

  useEffect(() => {
    if (profileData?.data?.data?.user) {
      setUser(profileData.data.data.user);
    }
  }, [profileData, setUser]);

  // ─── Fetch posts by type ───────────────────────────────────────────────
  const { data: publicPostsData, isLoading: loadingPublic } = useQuery({
    queryKey: ['userPosts', 'public'],
    queryFn: () => getUserPosts({ only: 'public', limit: 20 }),
  });

  const { data: privatePostsData, isLoading: loadingPrivate } = useQuery({
    queryKey: ['userPosts', 'private'],
    queryFn: () => getUserPosts({ only: 'onlyme', limit: 20 }),
  });

  const { data: friendsPostsData, isLoading: loadingFriends } = useQuery({
    queryKey: ['userPosts', 'friends'],
    queryFn: () => getUserPosts({ only: 'friends', limit: 20 }),
  });

  // Helper: extract posts from any API shape
  const extractPosts = (data: any): any[] => {
    const body = data?.data;
    return (
      body?.posts ||
      body?.data?.posts ||
      (Array.isArray(body?.data) ? body.data : []) ||
      (Array.isArray(body) ? body : []) ||
      []
    );
  };

  const publicPosts = extractPosts(publicPostsData);
  const privatePosts = extractPosts(privatePostsData);
  const friendsPosts = extractPosts(friendsPostsData);

  // ─── Change avatar mutation ────────────────────────────────────────────
  const avatarMutation = useMutation({
    mutationFn: (form: FormData) => changeUserIcon(form),
    onMutate: () => toast.loading('Uploading photo...', { id: 'avatar' }),
    onSuccess: (res) => { updateUser(res.data); toast.success('Photo updated!', { id: 'avatar' }); },
    onError: () => toast.error('Failed to update photo', { id: 'avatar' }),
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('photo', file);
    avatarMutation.mutate(form);
  }

  const displayName = user?.name || 'User';
  const displayPhoto = user?.photo || '';
  const coverPhoto = 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2938&auto=format&fit=crop';

  return (
    <PageLayout className="p-0 sm:p-0 lg:p-0 max-w-5xl mx-auto pb-16">
      <Toaster richColors />

      {/* ── Cover ── */}
      <div className="relative w-full h-48 sm:h-64 lg:h-72 bg-slate-200 dark:bg-slate-800 sm:rounded-b-2xl overflow-hidden group">
        <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      </div>

      {/* ── Profile Info ── */}
      <div className="px-4 sm:px-6 lg:px-8 relative pb-6 border-b border-slate-200/80 dark:border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-20 mb-4 gap-4">

          {/* Avatar */}
          <div className="relative z-10">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white dark:border-slate-950 shadow-md">
              <AvatarImage src={displayPhoto} className="object-cover" />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-200 font-bold">
                {displayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => photoInputRef.current?.click()}
              className="absolute bottom-2 right-2 p-2.5 bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-950 rounded-full shadow text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input type="file" accept="image/*" ref={photoInputRef} className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Edit Profile */}
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Button
              onClick={() => navigate('/setting')}
              className="gap-2 font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 rounded-full px-6 shadow-sm"
            >
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Name & stats */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{displayName}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{user?.email || ''}</p>
        </div>

        <div className="flex gap-6 mt-4 text-sm font-medium">
          <div className="text-slate-500 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-white text-base mr-1">{(user as any)?.followingCount ?? 0}</strong>Following
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-white text-base mr-1">{(user as any)?.followersCount ?? 0}</strong>Followers
          </div>
        </div>
      </div>

      {/* ── Posts Tabs ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="public" className="w-full">

          {/* Tab triggers */}
          <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 dark:border-border rounded-none p-0 h-auto mb-6 gap-0">
            <TabsTrigger
              value="public"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3.5 font-semibold text-slate-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 gap-2 whitespace-nowrap"
            >
              <Globe className="w-4 h-4" /> Public
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3.5 font-semibold text-slate-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 gap-2 whitespace-nowrap"
            >
              <Users className="w-4 h-4" /> Friends
            </TabsTrigger>
            <TabsTrigger
              value="private"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3.5 font-semibold text-slate-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 gap-2 whitespace-nowrap"
            >
              <Lock className="w-4 h-4" /> Only Me
            </TabsTrigger>
          </TabsList>

          {/* ── Public Posts ── */}
          <TabsContent value="public">
            <PostsGrid posts={publicPosts} isLoading={loadingPublic} emptyLabel="No public posts yet" emptyIcon={<Globe className="w-8 h-8 opacity-30" />} />
          </TabsContent>

          {/* ── Friends Posts ── */}
          <TabsContent value="friends">
            <PostsGrid posts={friendsPosts} isLoading={loadingFriends} emptyLabel="No friends-only posts yet" emptyIcon={<Users className="w-8 h-8 opacity-30" />} />
          </TabsContent>

          {/* ── Private Posts ── */}
          <TabsContent value="private">
            <PostsGrid posts={privatePosts} isLoading={loadingPrivate} emptyLabel="No private posts yet" emptyIcon={<Lock className="w-8 h-8 opacity-30" />} />
          </TabsContent>

        </Tabs>
      </div>
    </PageLayout>
  );
}

// ─── Shared Posts Grid component ───────────────────────────────────────────
function PostsGrid({
  posts,
  isLoading,
  emptyLabel,
  emptyIcon,
}: {
  posts: any[];
  isLoading: boolean;
  emptyLabel: string;
  emptyIcon: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-sm font-medium">Loading posts...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <div className="p-5 rounded-full bg-slate-100 dark:bg-slate-900">
          {emptyIcon}
        </div>
        <div className="text-center">
          <p className="font-semibold text-base text-slate-600 dark:text-slate-300">{emptyLabel}</p>
          <p className="text-sm mt-1">Posts you share will appear here.</p>
        </div>
      </div>
    );
  }

  // Check if any post has an image — if mostly image posts, use grid layout
  const hasImages = posts.some((p: any) => p.image);

  if (hasImages) {
    return (
      <div className="space-y-5">
        {posts.map((post: any) => (
          <PostItem key={post._id || post.id} post={post} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post: any) => (
        <PostItem key={post._id || post.id} post={post} />
      ))}
    </div>
  );
}
