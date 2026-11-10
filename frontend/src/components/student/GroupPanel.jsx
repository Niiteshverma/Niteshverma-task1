// Panel component for viewing student group membership, creating groups, and joining existing course groups
import { useState } from 'react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'

export default function GroupPanel({ courseId }) {
  const { currentUser } = useAuth()
  const { getGroupForStudent, getGroupsForCourse, getUserById, createGroup, joinGroup } =
    useData()
  const { showToast } = useToast()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [groupError, setGroupError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const studentGroup = currentUser ? getGroupForStudent(courseId, currentUser.id) : null
  const courseGroups = getGroupsForCourse(courseId)

  // Handle Create Group submission
  const handleCreateGroupSubmit = (e) => {
    e.preventDefault()
    const trimmed = newGroupName.trim()

    if (!trimmed) {
      setGroupError('Group name is required')
      return
    }

    setIsSubmitting(true)
    const result = createGroup({
      courseId,
      name: trimmed,
      leaderId: currentUser.id,
    })
    setIsSubmitting(false)

    if (!result.success) {
      setGroupError(result.error)
      return
    }

    showToast(`Group "${result.group.name}" created successfully!`, 'success')
    setNewGroupName('')
    setGroupError('')
    setIsCreateModalOpen(false)
  }

  // Handle Join Group
  const handleJoinGroup = (group) => {
    if (!currentUser) return

    const result = joinGroup({
      groupId: group.id,
      studentId: currentUser.id,
    })

    if (!result.success) {
      showToast(result.error, 'error')
      return
    }

    showToast(`Joined "${group.name}" successfully!`, 'success')
  }

  return (
    <>
      <Card className="border-slate-200 text-left space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Group Workspace
            </h2>
            <p className="text-xs text-slate-500">
              Collaborate on group assignments and project deliverables.
            </p>
          </div>

          {!studentGroup && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setGroupError('')
                setNewGroupName('')
                setIsCreateModalOpen(true)
              }}
              className="text-xs shrink-0"
            >
              + Create Group
            </Button>
          )}
        </div>

        {/* State 1: Student is in a group */}
        {studentGroup ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
                  Your Active Group
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {studentGroup.name}
                </h3>
              </div>
              <Badge variant="purple" size="sm">
                {studentGroup.memberIds.length}{' '}
                {studentGroup.memberIds.length === 1 ? 'Member' : 'Members'}
              </Badge>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Group Members ({studentGroup.memberIds.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {studentGroup.memberIds.map((memberId) => {
                  const member = getUserById(memberId)
                  const isLeader = memberId === studentGroup.leaderId
                  const isCurrent = memberId === currentUser?.id

                  return (
                    <div
                      key={memberId}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {member ? member.name.charAt(0) : '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {member ? member.name : 'Unknown Student'}
                            {isCurrent && (
                              <span className="text-slate-400 font-normal ml-1">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {member?.email}
                          </p>
                        </div>
                      </div>

                      {isLeader && (
                        <Badge variant="purple" size="sm">
                          Leader
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Student is not in any group */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800">
              <span className="font-semibold">Not in a group:</span> You are currently
              not part of any team for this course. Create a new group to become its
              leader, or join an existing group below.
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Available Groups in this Course ({courseGroups.length})
              </h3>

              {courseGroups.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No groups have been created yet. Click &quot;+ Create Group&quot; above to start the first team!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courseGroups.map((group) => {
                    const leader = getUserById(group.leaderId)

                    return (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition"
                      >
                        <div className="space-y-1 min-w-0 pr-3">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {group.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Leader:{' '}
                            <span className="font-medium text-slate-700">
                              {leader ? leader.name : 'Unknown'}
                            </span>{' '}
                            • {group.memberIds.length}{' '}
                            {group.memberIds.length === 1 ? 'member' : 'members'}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleJoinGroup(group)}
                          className="shrink-0 text-xs"
                        >
                          Join Group
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Create Group Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsCreateModalOpen(false)
            setGroupError('')
          }
        }}
        title="Create a New Group"
      >
        <form onSubmit={handleCreateGroupSubmit} className="space-y-4 text-left" noValidate>
          <p className="text-xs sm:text-sm text-slate-600">
            You will automatically become the group leader. Other enrolled students in
            this course can join your group.
          </p>

          <Input
            id="group-name-input"
            label="Group Name"
            placeholder="e.g. Distributed Pioneers"
            value={newGroupName}
            error={groupError}
            required
            onChange={(e) => {
              setNewGroupName(e.target.value)
              if (groupError) setGroupError('')
            }}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={isSubmitting}
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              Create &amp; Become Leader
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

