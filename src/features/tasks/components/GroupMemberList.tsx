import React from 'react'
import GroupMemberItem from './GroupMemberItem'
import { GroupMemberListProps } from '../../../types/tasks'

const GroupMemberList: React.FC<GroupMemberListProps> = ({ members }) => (
  <div style={{ marginTop: '8px' }}>
    <div>
      {Array.isArray(members) &&
        members.map((member, idx) => (
          <GroupMemberItem key={idx} name={member.name} profileUrl={member.profileUrl} />
        ))}
    </div>
  </div>
)

export default GroupMemberList
