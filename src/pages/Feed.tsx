import PageLayout from '@/components/layout/pageLayout';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import FeedLayout from '@/components/layout/feedLayout';

const Feed = () => {
    return (
        <PageLayout className="max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start justify-center">
            <Sidebar />
            <main className="flex-1 min-w-0 max-w-2xl w-full">
                <FeedLayout />
            </main>
            <RightSidebar />
        </PageLayout>
    );
};

export default Feed;

