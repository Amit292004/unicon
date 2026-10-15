'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  Search,
  MessageCircle,
  Sparkles,
  Send,
  Building2,
  BookOpen,
  Bus,
  FileText,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { useAppStore } from '@/lib/data/client-store'
import { formatRelativeTime } from '@/lib/utils'
import type { CampusQuestion } from '@/types'


export default function AskCampusPage() {
  const {
    currentProfile,
    campusQuestions,
    addCampusQuestion,
    toggleUpvoteCampusQuestion,
    addCampusAnswer,
    deleteCampusQuestion,
  } = useAppStore()

  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(campusQuestions[0]?.id || null)

  // New question form
  const [showAskModal, setShowAskModal] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [detailsText, setDetailsText] = useState('')
  const [category, setCategory] = useState<CampusQuestion['category']>('Academics')

  // Reply form state
  const [replyText, setReplyText] = useState('')
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)

  const categories = ['All', 'Academics', 'Hostel & Mess', 'Transit & Bus', 'Administrative', 'Campus Life']

  const collegeQuestions = campusQuestions.filter((q) => !q.collegeId || q.collegeId === currentProfile.collegeId)

  const filteredQuestions = collegeQuestions.filter((q) => {
    if (selectedCategory !== 'All' && q.category !== selectedCategory) return false
    if (searchQuery) {
      const match =
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.details.toLowerCase().includes(searchQuery.toLowerCase())
      if (!match) return false
    }
    return true
  })

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) return

    addCampusQuestion({
      category,
      question: questionText.trim(),
      details: detailsText.trim(),
    })

    setQuestionText('')
    setDetailsText('')
    setShowAskModal(false)
  }

  const handleToggleUpvote = (id: string) => {
    toggleUpvoteCampusQuestion(id)
  }

  const handlePostAnswer = (questionId: string) => {
    if (!replyText.trim()) return

    addCampusAnswer(questionId, replyText.trim())
    setReplyText('')
    setActiveReplyId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-2xs uppercase">
              Community Q&amp;A
            </Badge>
            <span className="text-2xs text-muted-foreground">
              {currentProfile.college?.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Ask Campus Community
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Crowdsourced academic queries, hostel guidelines, transport tips, and administrative answers
          </p>
        </div>

        <Button size="sm" onClick={() => setShowAskModal(true)} className="gap-1.5 text-xs">
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          Ask a Question
        </Button>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search questions by topic, course, or keyword..."
            className="pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground hover:bg-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Stream */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground text-xs space-y-3">
            <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground" aria-hidden="true" />
            <p className="font-semibold text-foreground">No questions found</p>
            <p>No queries match your search. Be the first to ask the campus community!</p>
            <Button size="sm" onClick={() => setShowAskModal(true)}>
              Ask Question
            </Button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.id
            const isUpvoted = q.hasUpvoted ?? false

            return (
              <Card key={q.id} className="p-5 border shadow-card space-y-4 transition">
                <div className="flex items-start gap-4">
                  {/* Upvote Pill */}
                  <button
                    type="button"
                    onClick={() => handleToggleUpvote(q.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border min-w-12 transition ${
                      isUpvoted
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border bg-secondary/40 text-muted-foreground hover:bg-accent'
                    }`}
                    aria-label={`Upvote question, currently ${q.upvotes}`}
                  >
                    <span className="text-xs font-bold">{q.upvotes}</span>
                    <span className="text-2xs uppercase tracking-wider">votes</span>
                  </button>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-2xs">
                        {q.category}
                      </Badge>
                      <span className="text-2xs text-muted-foreground">
                        Asked by {q.authorName} &bull; {formatRelativeTime(q.createdAt)}
                      </span>
                    </div>

                    <h2
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="text-base font-bold text-foreground hover:text-primary transition cursor-pointer leading-snug"
                    >
                      {q.question}
                    </h2>

                    {q.details && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {q.details}
                      </p>
                    )}
                  </div>
                </div>

                {/* Question Footer Bar */}
                <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="flex items-center gap-1.5 hover:text-foreground font-medium"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span>{q.answers.length} verified answers</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {(currentProfile.username === q.authorUsername || currentProfile.role === 'admin' || currentProfile.role === 'moderator') && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.confirm(`Delete question "${q.question}"?`)) {
                            deleteCampusQuestion(q.id)
                          }
                        }}
                        title="Delete Question"
                        aria-label="Delete question"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setExpandedQuestionId(q.id)
                        setActiveReplyId(q.id)
                      }}
                    >
                      Reply / Answer
                    </Button>
                  </div>
                </div>

                {/* Expanded Answers Thread */}
                {isExpanded && (
                  <div className="border-t pt-4 space-y-3 bg-secondary/20 p-4 rounded-lg">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Answers ({q.answers.length})
                    </p>

                    {q.answers.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        No responses posted yet. Share what you know to help your fellow students!
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {q.answers.map((ans) => (
                          <div key={ans.id} className="p-3 rounded-md bg-card border text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{ans.authorName}</span>
                                <Badge variant="secondary" className="text-2xs">
                                  {ans.role}
                                </Badge>
                              </div>
                              <span className="text-2xs text-muted-foreground">
                                {formatRelativeTime(ans.createdAt)}
                              </span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed pt-0.5">
                              {ans.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer Composer */}
                    <div className="pt-2 flex gap-2">
                      <Input
                        placeholder="Write a clear, helpful response..."
                        className="text-xs bg-background"
                        value={activeReplyId === q.id ? replyText : ''}
                        onChange={(e) => {
                          setActiveReplyId(q.id)
                          setReplyText(e.target.value)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handlePostAnswer(q.id)
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => handlePostAnswer(q.id)}
                      >
                        <Send className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                        Answer
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">Ask the Campus Community</CardTitle>
            </CardHeader>

            <form onSubmit={handlePostQuestion} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="q-topic">
                  Category
                </label>
                <select
                  id="q-topic"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CampusQuestion['category'])}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="Academics">Academics &amp; Syllabi</option>
                  <option value="Transit & Bus">Transit &amp; Bus Routes</option>
                  <option value="Hostel & Mess">Hostel &amp; Mess</option>
                  <option value="Administrative">Administrative Inquiries</option>
                  <option value="Campus Life">Campus Life &amp; Events</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="q-question">
                  Your Question
                </label>
                <Input
                  id="q-question"
                  placeholder="e.g. When will mid-semester retests be held?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="q-details">
                  Additional Context (Optional)
                </label>
                <textarea
                  id="q-details"
                  placeholder="Include specific section numbers, lab rooms, or relevant details..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={detailsText}
                  onChange={(e) => setDetailsText(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAskModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Publish Question
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
