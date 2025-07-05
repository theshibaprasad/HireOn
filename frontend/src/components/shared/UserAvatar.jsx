// components/shared/UserAvatar.jsx
import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'

const UserAvatar = ({ src, name = "User" }) => {
  const initials = name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()

  return (
    <Avatar className="cursor-pointer border">
      <AvatarImage src={src || ''} alt={name} />
      <AvatarFallback>{initials || 'U'}</AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar
