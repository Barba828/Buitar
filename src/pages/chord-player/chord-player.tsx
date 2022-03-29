import React, { useEffect } from 'react'
import {
	ChordController,
	GuitarBoard,
	ChordCard,
	BoardProvider,
	useBoardContext,
	BoardController,
	DetialCard,
} from '@/components/guitar-board'
import { transChordTaps } from 'to-guitar'
import { PianoBoard } from '@/components/piano-board'

export const ChordPlayer = () => {
	return (
		<BoardProvider>
			<ChordPlayerInner />
		</BoardProvider>
	)
}

const ChordPlayerInner = () => {
	const { chord, chordTaps, guitarBoardOption, setChordTaps, setTaps } = useBoardContext()

	// 指板更新：清除和弦指位列表
	useEffect(() => {
		setChordTaps(null)
	}, [guitarBoardOption])

	// 切换和弦：更新指板图列表
	useEffect(() => {
		setChordTaps(transChordTaps(chord, guitarBoardOption.keyboard))
	}, [chord])

	// 切换指板图：更新Taps指位
	useEffect(() => {
		setTaps([])
	}, [chord, chordTaps])

	return (
		<>
			<ChordController />
			<ChordDetail />
			<GuitarBoard />
			<ChordKeyboard />
			<BoardController />
		</>
	)
}

const ChordDetail = () => {
	const { taps } = useBoardContext()

	return (
		<div style={{ display: 'flex' }}>
			<ChordCard taps={taps} />
			<DetialCard />
		</div>
	)
}

const ChordKeyboard = () => {
	const { taps, player, boardOptions } = useBoardContext()
	const { isAllKey, isPianoKeyDown } = boardOptions
	const levels = isAllKey ? [2, 3, 4, 5] : [3]
	const notes = taps.map(
		(point) => `${point.toneSchema.note}${isAllKey ? point.toneSchema.level : 3}`
	)
	return (
		<PianoBoard player={player} checked={notes} levels={levels} disableKeydown={!isPianoKeyDown} />
	)
}
