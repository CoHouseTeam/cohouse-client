import React from 'react'
import GroupMemberItem from './GroupMemberItem'

interface Member {
  name: string
  avatarUrl: string
}

interface GroupMemberListProps {
  members: Member[]
}

const GroupMemberList: React.FC<GroupMemberListProps> = ({ members }) => (
  <div style={{ marginTop: '8px' }}>
    <div>
      {Array.isArray(members) && members.map((member, idx) => (
        <GroupMemberItem key={idx} name={member.name} avatarUrl={member.avatarUrl} />
      ))}
    </div>
  </div>
)

export default GroupMemberList
