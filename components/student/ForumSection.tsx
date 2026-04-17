import { ForumTopic, ForumReply } from "@/types/student";
import { CatBadge } from "./CatBadge";
import { Skeleton } from "./Skeleton";
import { Pin, ThumbsUp, Clock, X, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForumSectionProps {
  forumTopics: ForumTopic[];
  selectedTopic: ForumTopic | null;
  topicReplies: ForumReply[];
  loadingForum: boolean;
  loadingTopic: boolean;
  likedTopics: Set<number>;
  onTopicClick: (topic: ForumTopic) => void;
  onBackToTopics: () => void;
  onLikeTopic: (topicId: number, e?: React.MouseEvent) => void;
  onSubmitReply: () => void;
  newReply: string;
  onNewReplyChange: (value: string) => void;
  submittingReply: boolean;
}

export function ForumSection({
  forumTopics,
  selectedTopic,
  topicReplies,
  loadingForum,
  loadingTopic,
  likedTopics,
  onTopicClick,
  onBackToTopics,
  onLikeTopic,
  onSubmitReply,
  newReply,
  onNewReplyChange,
  submittingReply
}: ForumSectionProps) {
  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}j`;
  };

  if (selectedTopic) {
    return (
      <div className="space-y-5 max-w-3xl">
        <button
          onClick={onBackToTopics}
          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
        >
          <ArrowRight className="h-4 w-4 rotate-180" /> Retour à l'Agora
        </button>

        {loadingTopic ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>
        ) : (
          <>
            {/* Topic card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Bannière catégorie */}
              <div className={cn(
                "h-1.5",
                selectedTopic.category === "Carrière" && "bg-gradient-to-r from-blue-400 to-blue-600",
                selectedTopic.category === "Études" && "bg-gradient-to-r from-emerald-400 to-emerald-600",
                selectedTopic.category === "Tech & Code" && "bg-gradient-to-r from-violet-400 to-violet-600",
                selectedTopic.category === "Entrepreneuriat" && "bg-gradient-to-r from-orange-400 to-orange-600",
                selectedTopic.category === "Expériences" && "bg-gradient-to-r from-pink-400 to-pink-600",
                selectedTopic.category === "Questions" && "bg-gradient-to-r from-amber-400 to-amber-600",
                selectedTopic.category === "Général" && "bg-gradient-to-r from-slate-300 to-slate-500",
                !["Carrière","Études","Tech & Code","Entrepreneuriat","Expériences","Questions","Général"].includes(selectedTopic.category) && "bg-gradient-to-r from-primary to-violet-500",
              )} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {selectedTopic.is_pinned && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full border border-primary/20">
                      <Pin className="h-2.5 w-2.5" /> Épinglé
                    </span>
                  )}
                  <CatBadge cat={selectedTopic.category} />
                  {selectedTopic.tags?.map(tag => (
                    <span key={tag} className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                </div>

                <h1 className="text-xl font-bold text-slate-800 mb-5 leading-tight">{selectedTopic.title}</h1>

                {selectedTopic.content && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-5 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap border border-slate-100">
                    {selectedTopic.content}
                  </div>
                )}

                {/* Author + actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {selectedTopic.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{selectedTopic.author_name}</p>
                    <p className="text-xs text-slate-400">
                      {selectedTopic.author_university}
                      {selectedTopic.author_department ? ` · ${selectedTopic.author_department}` : ""}
                      {" · "}{timeAgo(selectedTopic.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => onLikeTopic(selectedTopic.id, e)}
                    className={cn(
                      "ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                      likedTopics.has(selectedTopic.id)
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    <ThumbsUp className={cn("h-3.5 w-3.5", likedTopics.has(selectedTopic.id) && "fill-current")} />
                    {selectedTopic.likes}
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800">Réponses ({topicReplies.length})</h2>
              
              {topicReplies.map(reply => (
                <div key={reply.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                      {reply.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-slate-700">{reply.author_name}</p>
                        <p className="text-xs text-slate-400">{timeAgo(reply.created_at)}</p>
                        {reply.is_helpful && (
                          <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Utile</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{reply.content}</p>
                      <button
                        onClick={() => {/* TODO: Implement like reply */}}
                        className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-primary"
                      >
                        <ThumbsUp className="h-3 w-3" /> {reply.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Reply form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-medium text-slate-800 mb-3">Répondre au sujet</h3>
                <textarea
                  value={newReply}
                  onChange={(e) => onNewReplyChange(e.target.value)}
                  placeholder="Partagez votre réponse..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  rows={4}
                />
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => onNewReplyChange("")}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={onSubmitReply}
                    disabled={!newReply.trim() || submittingReply}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submittingReply && <Loader2 className="h-4 w-4 animate-spin" />}
                    Publier
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Forum étudiant</h1>
        <p className="text-sm text-slate-500">{forumTopics.length} sujet{forumTopics.length > 1 ? "s" : ""} disponible{forumTopics.length > 1 ? "s" : ""}</p>
      </div>

      {loadingForum ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : forumTopics.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ThumbsUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Aucun sujet dans le forum</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forumTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onTopicClick(topic)}
              className="w-full bg-white rounded-2xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-slate-300 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {topic.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-slate-800 line-clamp-2">{topic.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {topic.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                      <CatBadge cat={topic.category} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {topic.author_name} · {topic.author_university && `${topic.author_university} · `}{timeAgo(topic.created_at)}
                  </p>
                  {topic.content && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{topic.content}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <button
                      onClick={(e) => onLikeTopic(topic.id, e)}
                      className={cn(
                        "flex items-center gap-1 transition-colors",
                        likedTopics.has(topic.id) ? "text-primary" : "hover:text-primary"
                      )}
                    >
                      <ThumbsUp className={cn("h-3.5 w-3.5", likedTopics.has(topic.id) && "fill-current")} />
                      {topic.likes}
                    </button>
                    <span>·</span>
                    <span>{topic.reply_count || 0} réponse{topic.reply_count === 1 ? "" : "s"}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
