// src/components/IconComponent
import React, { FC } from 'react'
import cx from 'classnames'

interface IconProps {
	name: string
	size?: number
	color?: string
	className?: string
}

export const Icon: FC<IconProps> = ({ name, size, color, className, ...restProps }) => {
	const style = size ? { width: size, height: size, color: color } : {}
	return (
		<svg className={cx('icon', className)} style={style} {...restProps} aria-hidden="true">
			<use xlinkHref={`#${name}`}></use>
		</svg>
	)
}