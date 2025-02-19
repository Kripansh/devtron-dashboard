import { useState } from 'react'
import { DynamicTabType, InitTabType } from './Types'

export function useTabs(persistanceKey: string) {
    const [tabs, setTabs] = useState<DynamicTabType[]>([])

    const populateTabData = (
        id: string,
        name: string,
        url: string,
        isSelected: boolean,
        title: string,
        positionFixed: boolean,
        iconPath: string,
    ) => {
        return {
            id,
            name,
            url,
            isSelected,
            title: title || name,
            isDeleted: false,
            positionFixed,
            iconPath,
        } as DynamicTabType
    }

    const stringifyData = (_tabs: any[], parsedTabsData?: Record<string, any>) => {
        let _parsedTabsData: Record<string, any> = {}

        if (parsedTabsData) {
            _parsedTabsData = parsedTabsData
        } else {
            const persistedTabsData = localStorage.getItem('persisted-tabs-data')
            try {
                _parsedTabsData = JSON.parse(persistedTabsData)
            } catch (err) {}
        }

        return JSON.stringify({
            ..._parsedTabsData,
            key: persistanceKey,
            data: _tabs,
        })
    }

    const populateInitTab = (_initTab: InitTabType, idx: number) => {
        const url = `${_initTab.url}${_initTab.url.endsWith('/') ? '' : '/'}`
        const title = _initTab.kind ? `${_initTab.kind}/${_initTab.name}` : _initTab.name
        const _id = `${_initTab.idPrefix}-${title}`
        return populateTabData(_id, title, url, idx === 0, title, _initTab.positionFixed, _initTab.iconPath)
    }

    const initTabs = (initTabsData: InitTabType[]) => {
        const persistedTabsData = localStorage.getItem('persisted-tabs-data')
        let parsedTabsData: Record<string, any> = {}
        let _tabs: DynamicTabType[]
        try {
            parsedTabsData = JSON.parse(persistedTabsData)
            _tabs = persistedTabsData ? parsedTabsData.data : tabs
        } catch (err) {
            _tabs = tabs
        }

        if (_tabs.length > 0) {
            const tabNames = _tabs.map((_tab) => _tab.name)
            initTabsData.forEach((_initTab, idx) => {
                if (!tabNames.includes(_initTab.name)) {
                    _tabs.push(populateInitTab(_initTab, idx))
                }
            })
        } else {
            initTabsData.forEach((_initTab, idx) => {
                _tabs.push(populateInitTab(_initTab, idx))
            })
        }

        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs, parsedTabsData))
        setTabs(_tabs)
    }

    const addTab = (
        idPrefix: string,
        kind: string,
        name: string,
        url: string,
        positionFixed?: boolean,
        iconPath?: string,
    ): boolean => {
        if (!name || !url || !kind) return

        const title = `${kind}/${name}`
        let alreadyAdded = false
        const _id = `${idPrefix}-${title}`
        const _tabs = tabs.map((tab) => {
            tab.isSelected = false
            if (tab.title.toLowerCase() === title.toLowerCase() && tab.id === _id) {
                tab.isSelected = true
                tab.url = url
                alreadyAdded = true
            }
            return tab
        })

        if (!alreadyAdded) {
            _tabs.push(populateTabData(_id, title, url, true, title, positionFixed, iconPath))
        }

        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
        return true
    }

    const removeTabByIdentifier = (title: string): string => {
        let pushURL = ''
        let selectedRemoved = false
        const _tabs = tabs.filter((tab) => {
            if (tab.title.toLowerCase() === title.toLowerCase()) {
                selectedRemoved = tab.isSelected
                return false
            }
            return true
        })

        if (selectedRemoved) {
            _tabs[0].isSelected = true
            pushURL = _tabs[0].url
        }

        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
        return pushURL
    }

    const markTabActiveByIdentifier = (idPrefix: string, name: string, kind?: string, url?: string) => {
        if (!name) return

        let isTabFound = false
        let title = name
        if (kind) {
            title = kind + '/' + name
        }

        const _id = `${idPrefix}-${title}`
        const _tabs = tabs.map((tab) => {
            tab.isSelected = false
            if (tab.title.toLowerCase() === title.toLowerCase() && tab.id === _id) {
                tab.isSelected = true
                tab.url = url || tab.url
                isTabFound = true
            }
            return tab
        })

        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
        return isTabFound
    }

    const markTabResourceDeletedByIdentifier = (idPrefix: string, name: string, kind?: string) => {
        let title = name
        if (kind) {
            title = kind + '/' + name
        }

        const _id = `${idPrefix}-${title}`
        const _tabs = tabs.map((tab) => {
            if (tab.title.toLowerCase() === title.toLowerCase() && tab.id === _id) {
                tab.isDeleted = true
            }
            return tab
        })
        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
    }

    const updateTabUrl = (id: string, url: string) => {
        const _tabs = tabs.map((tab) => {
            if (tab.id === id) {
                tab.url = url
            }
            return tab
        })
        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
    }

    return {
        tabs,
        initTabs,
        addTab,
        removeTabByIdentifier,
        markTabActiveByIdentifier,
        markTabResourceDeletedByIdentifier,
        updateTabUrl,
    }
}
