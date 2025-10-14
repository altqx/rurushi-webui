// API Types matching Rust backend
export interface Episode {
	id: number
	name: string
	file_path: string
	show_name: string
	episode_number: number | null
}

export interface PlaylistItem {
	show_name: string
	episode_range: [number, number] | null
	repeat_count: number
}

export type SubtitleMode = 'None' | 'Smart'

export interface ConfigResponse {
	videos_folder: string | null
	video_count: number
	show_count: number
	shows: Record<string, Episode[]>
	playlist: PlaylistItem[]
	subtitle_mode: SubtitleMode
	is_streaming: boolean
	current_playing: string | null
}

export interface ScanResponse {
	video_count: number
	show_count: number
	shows: Record<string, Episode[]>
}

export interface FileInfo {
	display_name: string
	file_path: string
	show_name: string
}

export interface FileListResponse {
	files: FileInfo[]
}

export interface ShowListResponse {
	shows: string[]
}

export interface ApiResponse<T> {
	success: boolean
	data: T | null
	error: string | null
}

// API Client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class ApiClient {
	private baseUrl: string

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl
	}

	private async request<T>(
		endpoint: string,
		options?: RequestInit
	): Promise<T> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers
			}
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => null)
			throw new Error(
				errorData?.error || `API request failed: ${response.statusText}`
			)
		}

		const apiResponse: ApiResponse<T> = await response.json()

		if (!apiResponse.success || !apiResponse.data) {
			throw new Error(apiResponse.error || 'API request failed')
		}

		return apiResponse.data
	}

	// Config endpoints
	async getConfig(): Promise<ConfigResponse> {
		return this.request<ConfigResponse>('/api/config')
	}

	async setFolder(path: string): Promise<void> {
		await this.request<void>('/api/folder', {
			method: 'POST',
			body: JSON.stringify({ path })
		})
	}

	async scanVideos(): Promise<ScanResponse> {
		return this.request<ScanResponse>('/api/scan', {
			method: 'POST'
		})
	}

	// File endpoints
	async getFiles(): Promise<FileListResponse> {
		return this.request<FileListResponse>('/api/files')
	}

	async getShows(): Promise<ShowListResponse> {
		return this.request<ShowListResponse>('/api/shows')
	}

	// Playback endpoints
	async playVideo(filePath: string): Promise<void> {
		await this.request<void>('/api/play', {
			method: 'POST',
			body: JSON.stringify({ file_path: filePath })
		})
	}

	async stopPlayback(): Promise<void> {
		await this.request<void>('/api/stop', {
			method: 'POST'
		})
	}

	async startStreaming(): Promise<void> {
		await this.request<void>('/api/start-streaming', {
			method: 'POST'
		})
	}

	async setSubtitleMode(mode: SubtitleMode): Promise<void> {
		await this.request<void>('/api/subtitle-mode', {
			method: 'POST',
			body: JSON.stringify({ mode })
		})
	}

	// Playlist endpoints
	async getPlaylist(): Promise<PlaylistItem[]> {
		return this.request<PlaylistItem[]>('/api/playlist')
	}

	async addToPlaylist(
		showName: string,
		episodeRange?: [number, number],
		repeatCount?: number
	): Promise<void> {
		await this.request<void>('/api/playlist/add', {
			method: 'POST',
			body: JSON.stringify({
				show_name: showName,
				episode_range: episodeRange || null,
				repeat_count: repeatCount || 0
			})
		})
	}

	async removeFromPlaylist(index: number): Promise<void> {
		await this.request<void>(`/api/playlist/${index}`, {
			method: 'DELETE'
		})
	}

	async movePlaylistItem(
		index: number,
		direction: 'up' | 'down'
	): Promise<void> {
		await this.request<void>('/api/playlist/move', {
			method: 'POST',
			body: JSON.stringify({ index, direction })
		})
	}

	async clearPlaylist(): Promise<void> {
		await this.request<void>('/api/playlist', {
			method: 'DELETE'
		})
	}
}

export const api = new ApiClient(API_BASE_URL)
