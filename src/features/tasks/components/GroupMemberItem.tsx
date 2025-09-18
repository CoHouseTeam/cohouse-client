import React from 'react'
import { Member } from '../../../types/tasks'

const GroupMemberItem: React.FC<Member> = ({ name, profileImageUrl }) => (
  <div className="card card-bordered bg-base-100 flex-row items-center p-2 mb-3 shadow border-base-200">
    <div className="avatar">
      <div className="w-10 h-10 rounded-full">
        <img src={profileImageUrl} alt={name} />
      </div>
    </div>
    <span className="ml-3 font-medium text-gray-700">{name}</span>
  </div>
)

export default GroupMemberItem
