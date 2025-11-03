'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import type {
	ConfigResponse,
	FileListResponse,
	ShowListResponse
} from '@/lib/api'
import { api } from '@/lib/api'

export function useConfig() {
	const [config, setConfig] = useState<ConfigResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const isMountedRef = useRef(true)

	const fetchConfig = useCallback(async () => {
		try {
			setLoading(true)
			const data = await api.getConfig()
			if (isMountedRef.current) {
				setConfig(data)
				setError(null)
			}
		} catch (err) {
			if (isMountedRef.current) {
				setError(err instanceof Error ? err.message : 'Failed to fetch config')
			}
		} finally {
			if (isMountedRef.current) {
				setLoading(false)
			}
		}
	}, [])

	useEffect(() => {
		isMountedRef.current = true
		fetchConfig()
		return () => {
			isMountedRef.current = false
		}
	}, [])

	return { config, loading, error, refetch: fetchConfig }
}

export function useFiles() {
	const [files, setFiles] = useState<FileListResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchFiles = useCallback(async () => {
		try {
			setLoading(true)
			const data = await api.getFiles()
			setFiles(data)
			setError(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch files')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchFiles()
	}, [fetchFiles])

	return { files, loading, error, refetch: fetchFiles }
}

export function useShows() {
	const [shows, setShows] = useState<ShowListResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchShows = useCallback(async () => {
		try {
			setLoading(true)
			const data = await api.getShows()
			setShows(data)
			setError(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch shows')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchShows()
	}, [fetchShows])

	return { shows, loading, error, refetch: fetchShows }
}
