import PageLayout from '@/components/layout/pageLayout';
import Sidebar from '@/components/layout/Sidebar';
import FeedLayout from '@/components/layout/feedLayout';

const Feed = () => {
    return (
        <PageLayout className="max-w-6xl flex gap-6 items-start">
            <Sidebar />
            <div className="flex-1 min-w-0">
                <FeedLayout />
            </div>
        </PageLayout>
    );
}

export default Feed;
