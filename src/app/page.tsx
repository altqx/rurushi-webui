'use client'

import { useState, useEffect } from 'react'
import { useConfig, useFiles, useShows } from '@/hooks/useApi'
import { api } from '@/lib/api'
import type { SubtitleMode } from '@/lib/api'

export default function Home() {
	const { config, loading, error, refetch } = useConfig()
	const { files, refetch: refetchFiles } = useFiles()
	const { shows, refetch: refetchShows } = useShows()

	const [videosFolder, setVideosFolder] = useState('')
	const [statusMessage, setStatusMessage] = useState('Ready')
	const [isScanning, setIsScanning] = useState(false)

	useEffect(() => {
		if (config?.videos_folder && !videosFolder) {
			setVideosFolder(config.videos_folder)
		}
	}, [config?.videos_folder, videosFolder])

	const handleSetFolder = async () => {
		if (!videosFolder.trim()) {
			setStatusMessage('Please enter a folder path')
			return
		}

		try {
			await api.setFolder(videosFolder)
			setStatusMessage('Folder saved successfully')
			setTimeout(() => refetch(), 100)
		} catch (err) {
			setStatusMessage(
				`Error: ${err instanceof Error ? err.message : 'Failed to set folder'}`
			)
		}
	}

	const handleScanVideos = async () => {
		try {
			setIsScanning(true)
			setStatusMessage('Scanning videos...')
			const result = await api.scanVideos()
			setStatusMessage(
				`Found ${result.video_count} videos in ${result.show_count} shows`
			)
			refetch()
			refetchFiles()
			refetchShows()
		} catch (err) {
			setStatusMessage(
				`Error: ${err instanceof Error ? err.message : 'Failed to scan'}`
			)
		} finally {
			setIsScanning(false)
		}
	}

	const handlePlayFile = async (filePath: string) => {
		try {
			await api.playVideo(filePath)
			setStatusMessage(`Playing: ${filePath}`)
			refetch()
		} catch (err) {
			setStatusMessage(
				`Error: ${err instanceof Error ? err.message : 'Failed to play'}`
			)
		}
	}

	const handleStopPlayback = async () => {
		try {
			await api.stopPlayback()
			setStatusMessage('Playback stopped - Test card active')
			refetch()
		} catch (err) {
			setStatusMessage(
				`Error: ${err instanceof Error ? err.message : 'Failed to stop'}`
			)
		}
	}

	const handleStartStreaming = async () => {
		try {
			await api.startStreaming()
			setStatusMessage('Streaming started')
			setTimeout(() => refetch(), 100)
		} catch (err) {
			setStatusMessage(
				`Error: ${err instanceof Error ? err.message : 'Failed to start streaming'}`
			)
		}
	}

	const handleSetSubtitleMode = async (mode: SubtitleMode) => {
		try {
			await api.setSubtitleMode(mode)
			setStatusMessage(`Subtitle mode set to ${mode}`)
			setTimeout(() => refetch(), 100)
		} catch (err) {
			setStatusMessage(
				`Error: ${err instanceof Error ? err.message : 'Failed to set subtitle mode'}`
			)
		}
	}

	const handleAddToPlaylist = async (showName: string) => {
		try {
			await api.addToPlaylist(showName)
			setStatusMessage(`Added ${showName} to playlist`)
			refetch()
		} catch (err) {
			setStatusMessage(
				`Error: ${err instanceof Error ? err.message : 'Failed to add to playlist'}`
			)
		}
	}

	const handleRemoveFromPlaylist = async (index: number) => {
		try {
			await api.removeFromPlaylist(index)
			setStatusMessage('Removed from playlist')
			refetch()
		} catch (err) {
			setStatusMessage(
				`Error: ${err instanceof Error ? err.message : 'Failed to remove from playlist'}`
			)
		}
	}

	const handleMovePlaylistItem = async (
		index: number,
		direction: 'up' | 'down'
	) => {
		try {
			await api.movePlaylistItem(index, direction)
			setStatusMessage('Playlist order updated')
			refetch()
		} catch (err) {
			setStatusMessage(
				`Error: ${err instanceof Error ? err.message : 'Failed to move item'}`
			)
		}
	}

	const handleClearPlaylist = async () => {
		try {
			await api.clearPlaylist()
			setStatusMessage('Playlist cleared')
			refetch()
		} catch (err) {
			setStatusMessage(
				`Error: ${err instanceof Error ? err.message : 'Failed to clear playlist'}`
			)
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-xl'>Loading...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-red-500'>Error: {error}</div>
			</div>
		)
	}

	if (!config) {
		return null
	}

	return (
		<div className='min-h-screen p-8 pb-20 gap-16 sm:p-20 max-w-5xl mx-auto'>
			<div className='space-y-8'>
				{/* Header */}
				<div>
					<h1 className='text-4xl font-bold mb-2'>Rurushi HLS Server</h1>
					<p className='text-gray-400'>Video streaming control panel</p>
				</div>

				{/* Videos Folder Section */}
				<section className='space-y-4'>
					<h2 className='text-2xl font-semibold'>Videos Folder</h2>
					<div className='flex gap-2'>
						<input
							type='text'
							value={videosFolder}
							onChange={(e) => setVideosFolder(e.target.value)}
							placeholder='Enter videos folder path...'
							className='flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500'
						/>
						<button
							type='button'
							onClick={handleSetFolder}
							className='px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition'
						>
							Set Folder
						</button>
						<button
							type='button'
							onClick={handleScanVideos}
							disabled={isScanning}
							className='px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition disabled:opacity-50'
						>
							{isScanning ? 'Scanning...' : 'Scan Videos'}
						</button>
					</div>

					<div className='text-sm text-gray-400 space-y-1'>
						<p>Videos found: {config.video_count}</p>
						<p>Shows organized: {config.show_count}</p>
					</div>
				</section>

				{/* Subtitle Mode Section */}
				<section className='space-y-4'>
					<h2 className='text-2xl font-semibold'>Subtitle Mode</h2>
					<div className='flex gap-4'>
						<button
							type='button'
							onClick={() => handleSetSubtitleMode('None')}
							className={`px-6 py-2 rounded font-medium transition ${
								config.subtitle_mode === 'None'
									? 'bg-blue-600 hover:bg-blue-700'
									: 'bg-gray-700 hover:bg-gray-600'
							}`}
						>
							{config.subtitle_mode === 'None' ? '● ' : '○ '}None
						</button>
						<button
							type='button'
							onClick={() => handleSetSubtitleMode('Smart')}
							className={`px-6 py-2 rounded font-medium transition ${
								config.subtitle_mode === 'Smart'
									? 'bg-blue-600 hover:bg-blue-700'
									: 'bg-gray-700 hover:bg-gray-600'
							}`}
						>
							{config.subtitle_mode === 'Smart' ? '● ' : '○ '}Smart
						</button>
					</div>
				</section>

				{/* Streaming Control Section */}
				<section className='space-y-4'>
					<h2 className='text-2xl font-semibold'>Streaming Control</h2>
					<button
						type='button'
						onClick={handleStartStreaming}
						className={`w-full px-6 py-3 rounded font-medium text-lg transition ${
							config.is_streaming
								? 'bg-green-600 hover:bg-green-700'
								: 'bg-blue-600 hover:bg-blue-700'
						}`}
					>
						{config.is_streaming ? 'Streaming Active ✓' : 'Start Streaming'}
					</button>
				</section>

				{/* Playback Controller Section */}
				<section className='space-y-4'>
					<h2 className='text-2xl font-semibold'>Playback Controller</h2>

					<div className='text-sm'>
						{config.current_playing ? (
							<p>
								Now Playing:{' '}
								<span className='text-green-400'>{config.current_playing}</span>
							</p>
						) : (
							<p className='text-gray-400'>Not playing - Test card active</p>
						)}
					</div>

					<div className='space-y-2'>
						<p className='text-sm font-medium'>Select file to play:</p>
						<div className='max-h-60 overflow-y-auto space-y-1 border border-gray-700 rounded p-2'>
							{files && files.files.length > 0 ? (
								files.files.slice(0, 20).map((file) => (
									<button
										type='button'
										key={file.file_path}
										onClick={() => handlePlayFile(file.file_path)}
										className='w-full text-left px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded transition'
									>
										{file.display_name}
									</button>
								))
							) : (
								<p className='text-sm text-gray-500 p-2'>
									No files available - scan videos first
								</p>
							)}
						</div>
					</div>

					<button
						type='button'
						onClick={handleStopPlayback}
						className='w-full px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-medium transition'
					>
						⏹ Stop Playback (Show Test Card)
					</button>
				</section>

				{/* Playlist Editor Section */}
				<section className='space-y-4'>
					<h2 className='text-2xl font-semibold'>Playlist Editor</h2>

					<div className='space-y-2'>
						<p className='text-sm font-medium'>Add show to playlist:</p>
						<div className='max-h-40 overflow-y-auto space-y-1 border border-gray-700 rounded p-2'>
							{shows && shows.shows.length > 0 ? (
								shows.shows.map((show) => (
									<button
										type='button'
										key={show}
										onClick={() => handleAddToPlaylist(show)}
										className='w-full text-left px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded transition'
									>
										+ {show}
									</button>
								))
							) : (
								<p className='text-sm text-gray-500 p-2'>
									No shows available - scan videos first
								</p>
							)}
						</div>
					</div>

					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<p className='text-sm font-medium'>
								Current Playlist ({config.playlist.length} items):
							</p>
							{config.playlist.length > 0 && (
								<button
									type='button'
									onClick={handleClearPlaylist}
									className='px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition'
								>
									Clear Playlist
								</button>
							)}
						</div>

						<div className='max-h-60 overflow-y-auto space-y-1 border border-gray-700 rounded p-2'>
							{config.playlist.length > 0 ? (
								config.playlist.map((item, idx) => (
									<div
										key={`${item.show_name}-${item.episode_range ? item.episode_range.join('-') : 'all'}`}
										className='flex items-center gap-2 px-3 py-2 bg-gray-800 rounded'
									>
										<span className='flex-1 text-sm'>
											{item.show_name}
											{item.episode_range &&
												` - Episodes ${item.episode_range[0]}-${item.episode_range[1]}`}
										</span>
										<button
											type='button'
											onClick={() => handleMovePlaylistItem(idx, 'up')}
											disabled={idx === 0}
											className='px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition'
										>
											↑
										</button>
										<button
											type='button'
											onClick={() => handleMovePlaylistItem(idx, 'down')}
											disabled={idx === config.playlist.length - 1}
											className='px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition'
										>
											↓
										</button>
										<button
											type='button'
											onClick={() => handleRemoveFromPlaylist(idx)}
											className='px-2 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition'
										>
											✖
										</button>
									</div>
								))
							) : (
								<p className='text-sm text-gray-500 p-2'>Playlist is empty</p>
							)}
						</div>
					</div>
				</section>

				{/* Status Message */}
				<div className='mt-8 p-4 bg-gray-800 rounded border border-gray-700'>
					<p className='text-sm text-gray-300'>Status: {statusMessage}</p>
				</div>
			</div>
		</div>
	)
}
