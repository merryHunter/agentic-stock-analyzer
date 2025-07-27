import NewsSidebar from "@/components/news-sidebar";
import ChatSidebar from "@/components/chat-sidebar";
import MainView from "@/components/main-view";

export default function Home() {
  return (
    <div className="dashboard">
      <NewsSidebar />
      <MainView />
      <ChatSidebar />
    </div>
  );
}
