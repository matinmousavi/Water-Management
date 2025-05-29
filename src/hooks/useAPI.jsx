import { useEffect, useState, useRef, createContext } from 'react'
import useNotification from '../hooks/useNotification'

const apiUrl = '/api'

const APIContext = createContext({})

export function APIProvider({ config = { cache: false }, requests, cache = {}, children }) {
	return <APIContext.Provider value={{ config, requests, cache }}>{children}</APIContext.Provider>
}

export default function useAPI() {
	const [data, setData] = useState(false)
	const [isLoading, setLoading] = useState(false)
	const [error, setError] = useState(false)
	const [request, setRequest] = useState(null)
	const lastRequestRef = useRef({})
	const callsRef = useRef(0)
	const { openNotification } = useNotification()

	async function getAPI({ requestUrl, method = 'GET', setState = true, params, signal, resolve, reject } = {}) {
		const requestInit = { method, headers: {}, credentials: 'include', signal }
		let querystring = ''

		switch (method) {
			case 'GET':
				if (params && typeof params === 'object') {
					querystring = '?' + new URLSearchParams(params).toString()
				} else if (typeof params === 'string' && params.startsWith('?')) {
					querystring = params
				}
				break
			case 'DELETE':
			case 'POST':
			case 'PUT':
			case 'PATCH':
				if (params instanceof FormData) {
					requestInit.body = params
				} else {
					requestInit.headers = {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					}
					requestInit.body = JSON.stringify(params)
				}
				break
		}

		if (callsRef.current === 0) setLoading(true)
		callsRef.current++

		try {
			const url = `${apiUrl.replace(/\/+$/g, '')}/${requestUrl.replace(/^\/+/g, '')}${querystring}`
			const response = await fetch(url, requestInit)
			const contentType = response.headers.get('Content-Type') || ''
			const data = contentType.includes('application/json') ? await response.json() : await response.text()

			if (response.status === 200 || response.status === 201) {
				if (setState) setData(data)
				if (resolve) resolve(data)
				setError(false)
				return data
			} else {
				const errObj = {
					error: {
						status: response.status,
						statusText: response.statusText,
						...data,
					},
				}

				if (response.status === 401 || response.status === 403) {
					const currentPath = window.location.pathname
					if (currentPath !== '/') {
						window.location.replace('/')
					}
				}

				if (response.status === 406) {
					openNotification('error', data.message)
				}

				setError(errObj)
				throw errObj
			}
		} catch (error) {
			if (error.code !== 20) setError(error)
			throw error
		} finally {
			callsRef.current--
			if (callsRef.current <= 1) setLoading(false)
		}
	}

	useEffect(() => {
		if (!request) return
		const { requestUrl, params, forceRefresh } = request
		const controller = new AbortController()
		getAPI({ requestUrl, params, signal: controller.signal, forceRefresh }).catch(() => {})
		return () => controller.abort()
	}, [request])

	return {
		init: (requestUrl, params = false, forceRefresh = false) => {
			const last = lastRequestRef.current
			if (last.requestUrl === requestUrl && JSON.stringify(last.params) === JSON.stringify(params) && last.forceRefresh === forceRefresh) return

			lastRequestRef.current = { requestUrl, params, forceRefresh }
			setRequest({ requestUrl, params, forceRefresh })
		},
		get: (requestUrl, params) => getAPI({ requestUrl, params }),
		post: (requestUrl, params) => getAPI({ requestUrl, method: 'POST', params, setState: false }),
		put: (requestUrl, params) => getAPI({ requestUrl, method: 'PUT', params, setState: false }),
		delete: (requestUrl, params) => getAPI({ requestUrl, method: 'DELETE', params, setState: false }),
		patch: (requestUrl, params) => getAPI({ requestUrl, method: 'PATCH', params, setState: false }),
		setData,
		data,
		isLoading,
		error,
	}
}
