import React, { FC, useEffect, useMemo } from 'react'
import type { Point, ToneSchema } from 'to-guitar'
import { useBoardContext } from '../board-provider'
import { getBoardOptionsTone } from '../utils'
import { GuitarBoardOptions } from '../board-controller/controller.type'
import { useBoardTouch, useGuitarKeyDown } from '@/utils/hooks/use-board-event'
import { useDebounce } from '@/utils/hooks/use-debouce'
import cx from 'classnames'
import styles from './guitar-board.module.scss'

interface GuitarBoardProps {
	range?: [number, number]
	onCheckedPoints?: (points: Point[]) => void
	onChangePart?: (part: boolean) => void
}

const FRET_DOT = [, , '·', , '·', , '·', , '·', , , '··', , , , '·']

export const GuitarBoard: FC<GuitarBoardProps> = ({
	range = [1, 16],
	onCheckedPoints,
	onChangePart,
}) => {
	const {
		guitarBoardOption: { keyboard },
		boardOptions: { hasTag },
		emphasis,
		setEmphasis,
		player,
	} = useBoardContext()

	// 鼠标事件监听
	const { handler } = useBoardTouch(emphasis, setEmphasis)
	// 键盘事件监听
	const { part, keyHandler } = useGuitarKeyDown(emphasis, setEmphasis)

	const boardList = useMemo(() => {
		if (!keyboard) {
			return null
		}
		return exchangeBoardList(keyboard)
	}, [keyboard])

	const debouceEmphasis = useDebounce(emphasis, 30)
	useEffect(() => {
		if (debouceEmphasis.length <= 0 || !boardList) {
			return
		}
		const points = debouceEmphasis.map((index) => boardList[Number(index)])

		player.triggerPointRelease(points)
		onCheckedPoints?.(points)
	}, [debouceEmphasis])

	useEffect(() => {
		onChangePart?.(part)
	}, [part])

	if (!keyboard) {
		return null
	}

	const board = exchangeBoardArray(keyboard)

	const boardView = board.slice(range[0], range[1]).map((frets, fretIndex) => {
		const fretsView = frets
			.reverse()
			.map((point, stringIndex) => <BoardButton key={stringIndex} point={point} />)

		const dotsView = (
			<div
				className={cx(
					'buitar-primary-button',
					styles['frets-dot'],
					!hasTag && styles['frets-hidden']
				)}
			>
				{FRET_DOT[fretIndex]}
				<span className={styles['frets-dot-text']}>{fretIndex + 1}</span>
			</div>
		)
		return (
			<ul className={cx(styles.frets)} key={fretIndex}>
				{fretsView}
				{dotsView}
			</ul>
		)
	})

	const zeroView = board.slice(0, 1).map((frets, fretIndex) => {
		const fretsView = frets
			.reverse()
			.map((point, stringIndex) => <BoardButton key={stringIndex} point={point} />)

		return (
			<ul className={cx(styles.frets, styles['frets-zero'])} key={fretIndex}>
				{fretsView}
			</ul>
		)
	})

	return (
		<div id="fret-board" className={cx(styles.board)} {...handler} {...keyHandler}>
			<div className={styles['board-view']}>{zeroView}</div>
			<div className={'scroll-without-bar'}>
				<div className={styles['board-view']}>{boardView}</div>
			</div>
		</div>
	)
}

const BoardButton = ({
	point,
	itemClassName,
	touched = [],
}: { point: Point; itemClassName?: string; touched?: string[] } & GuitarBoardProps) => {
	const { boardOptions, taps, emphasis } = useBoardContext()
	const { hasLevel, isNote } = boardOptions

	// key
	const key = `${point.index}`
	// 强调的point
	const emphasised = emphasis.includes(key) || touched.includes(key)
	// 被点击的point
	const tapped = taps.findIndex((tap) => tap.index === point.index) !== -1
	// 显示音调文本
	const tone = getBoardOptionsTone(point.toneSchema, boardOptions, !tapped)
	// 显示八度音高
	const level = tone && getLevel(point.toneSchema, boardOptions)

	const cls = cx(
		'buitar-primary-button',
		!tone && styles['empty-point'], // 隐藏半音
		!isNote && hasLevel && point.toneSchema.level //处理数字显示时八度音高
			? point.toneSchema.level > 3
				? styles['interval-point-reverse']
				: styles['interval-point']
			: null,
		emphasised && styles['emphasised-point'], // 被强调的point
		tapped && styles['tapped-point'], // 被点击的point
		styles['point'],
		itemClassName
	)

	return (
		<li className={cls} key={key} data-key={key}>
			{tone}
			{level}
		</li>
	)
}

/**
 * 数字显示下的八度音高UI
 * @param toneSchema
 * @param boardOptions
 */
const getLevel = (toneSchema: ToneSchema, boardOptions: GuitarBoardOptions) => {
	if (!boardOptions.hasLevel || !toneSchema.level) {
		return null
	}
	const { level } = toneSchema
	if (boardOptions.isNote) {
		return <span className={styles.level}>{level}</span>
	}
	return (
		<span className={styles['level-dot']}>{new Array(Math.abs(level - 3)).fill('·').join('')}</span>
	)
}

/**
 * 二维数组纵横交换
 * @returns
 */
const exchangeBoardArray = (keyboard: Point[][]) => {
	const board: Point[][] = []
	keyboard.forEach((string, stringIndex) => {
		string.forEach((point, fretIndex) => {
			if (board[fretIndex]) {
				board[fretIndex][stringIndex] = point
			} else {
				board[fretIndex] = [point]
			}
		})
	})
	return board
}

const exchangeBoardList = (keyboard: Point[][]) => {
	const list: Point[] = []
	keyboard.forEach((string) => {
		list.push(...string)
	})
	return list
}
