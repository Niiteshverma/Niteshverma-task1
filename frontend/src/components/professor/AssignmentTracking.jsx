// Modal drill-down component for tracking student and group assignment acknowledgements
import { useState } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'
import EmptyState from '../ui/EmptyState'
import { useData } from '../../context/DataContext'
import { SUBMISSION_TYPE } from '../../utils/constants'
import { formatDateTime, getPercentage } from '../../utils/helpers'

export default function AssignmentTracking({ assignment, course }) {
  const { getUserById, getGroupsForCourse, getAcknowledgementsForAssignment } = useData()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'acknowledged' | 'pending'

  const isGroup = assignment.submissionType === SUBMISSION_TYPE.GROUP
  const acks = getAcknowledgementsForAssignment(assignment.id)

  // Compute dataset based on submission type
  let items = []

  if (isGroup) {
    const courseGroups = getGroupsForCourse(course.id)
    items = courseGroups.map((group) => {
      const ack = acks.find((a) => a.groupId === group.id)
      const isAcknowledged = Boolean(ack)
      const leader = group.leaderId ? getUserById(group.leaderId) : null
      const isLate =
        isAcknowledged &&
        assignment.deadline &&
        new Date(ack.acknowledgedAt).getTime() > new Date(assignment.deadline).getTime()

      return {
        id: group.id,
        name: group.name,
        leaderName: leader ? leader.name : 'Unknown Leader',
        memberCount: group.memberIds?.length || 0,
        isAcknowledged,
        acknowledgedAt: ack?.acknowledgedAt,
        acknowledgedBy: leader?.name || 'Group Leader',
        isLate,
      }
    })
  } else {
    const studentIds = course.studentIds || []
    items = studentIds.map((studentId) => {
      const student = getUserById(studentId)
      const ack = acks.find((a) => a.studentId === studentId)
      const isAcknowledged = Boolean(ack)
      const isLate =
        isAcknowledged &&
        assignment.deadline &&
        new Date(ack.acknowledgedAt).getTime() > new Date(assignment.deadline).getTime()

      return {
        id: studentId,
        name: student ? student.name : 'Unknown Student',
        email: student?.email || '',
        isAcknowledged,
        acknowledgedAt: ack?.acknowledgedAt,
        isLate,
      }
    })
  }

  // Summary Metrics
  const totalCount = items.length
  const submittedCount = items.filter((i) => i.isAcknowledged).length
  const pendingCount = totalCount - submittedCount
  const completionPercentage = getPercentage(submittedCount, totalCount)

  // Filtered dataset according to search and status selection
  const filteredItems = items.filter((item) => {
    // Status filter
    if (statusFilter === 'acknowledged' && !item.isAcknowledged) return false
    if (statusFilter === 'pending' && item.isAcknowledged) return false

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const matchName = item.name.toLowerCase().includes(query)
      const matchEmail = item.email ? item.email.toLowerCase().includes(query) : false
      const matchLeader = item.leaderName ? item.leaderName.toLowerCase().includes(query) : false
      if (!matchName && !matchEmail && !matchLeader) return false
    }

    return true
  })

  return (
    <div className="space-y-6 text-left">
      {/* Header Summary Statistics */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Submission Progress
            </h4>
            <p className="text-lg font-bold text-slate-900">
              {submittedCount} / {totalCount} {isGroup ? 'Groups' : 'Students'} ({completionPercentage}%)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              {submittedCount} Submitted
            </Badge>
            <Badge variant="neutral" size="sm">
              {pendingCount} Pending
            </Badge>
          </div>
        </div>

        <ProgressBar value={submittedCount} max={totalCount} size="md" />
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            id="tracking-search"
            placeholder={isGroup ? 'Search by group or leader name...' : 'Search by student name or email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <Select
            id="tracking-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Submissions' },
              { value: 'acknowledged', label: 'Acknowledged Only' },
              { value: 'pending', label: 'Pending Only' },
            ]}
          />
        </div>
      </div>

      {/* Roster List */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {totalCount === 0 ? (
          <EmptyState
            title={isGroup ? 'No Groups Formed' : 'No Students Enrolled'}
            description={
              isGroup
                ? 'No student groups have been created in this course yet.'
                : 'There are currently no students enrolled in this course.'
            }
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No Matches Found"
            description="No submissions match your current search and filter criteria."
          />
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {item.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {isGroup
                      ? `Leader: ${item.leaderName} • ${item.memberCount} members`
                      : item.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.isAcknowledged ? (
                  <div className="flex flex-col sm:items-end text-left sm:text-right">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="success" size="sm" dot>
                        Acknowledged
                      </Badge>
                      {item.isLate && (
                        <Badge variant="warning" size="sm">
                          Late
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {isGroup
                        ? `By ${item.acknowledgedBy} • ${formatDateTime(item.acknowledgedAt)}`
                        : formatDateTime(item.acknowledgedAt)}
                    </span>
                  </div>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
