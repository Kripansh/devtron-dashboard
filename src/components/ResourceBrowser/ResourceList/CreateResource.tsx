import React, { useEffect, useRef, useState } from 'react'
import { APP_STATUS_HEADERS, MODES } from '../../../config'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Success } from '../../../assets/icons/ic-success.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import mechanicalOperation from '../../../assets/img/ic-mechanical-operation.svg'
import { showError, Progressing, Drawer, InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { CreateResourcePayload, CreateResourceStatus, CreateResourceType, ResourceType } from '../Types'
import { createNewResource } from '../ResourceBrowser.service'
import ResourceListEmptyState from './ResourceListEmptyState'
import { CREATE_RESOURCE_MODAL_MESSAGING } from '../Constants'

export function CreateResource({ closePopup, clusterId }: CreateResourceType) {
    const [showCodeEditorView, toggleCodeEditorView] = useState(true)
    const [loader, setLoader] = useState(false)
    const [resourceYAML, setResourceYAML] = useState('')
    const [resourceResponse, setResourceResponse] = useState<ResourceType[]>(null)

    const appStatusDetailRef = useRef<HTMLDivElement>(null)
    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape') {
            evt.preventDefault()
            onClose()
        }
    }
    const outsideClickHandler = (evt): void => {
        if (appStatusDetailRef.current && !appStatusDetailRef.current.contains(evt.target)) {
            onClose()
        }
    }
    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    const onClose = (): void => {
        !loader && closePopup()
    }

    const handleEditorValueChange = (codeEditorData: string): void => {
        setResourceYAML(codeEditorData)
    }

    const showCodeEditor = (): void => {
        toggleCodeEditorView(true)
    }

    const onSave = async (): Promise<void> => {
        try {
            setLoader(true)
            const resourceListPayload: CreateResourcePayload = {
                clusterId: Number(clusterId),
                manifest: resourceYAML,
            }
            const { result } = await createNewResource(resourceListPayload)
            if (result) {
                setResourceResponse(result)
                toggleCodeEditorView(false)
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    const renderFooter = (): JSX.Element => {
        if (showCodeEditorView) {
            return (
                <div className="dc__border-top flex right p-16">
                    <button className="cta cancel h-36 lh-36 mr-12" type="button" disabled={loader} onClick={onClose}>
                        {CREATE_RESOURCE_MODAL_MESSAGING.actionButtonText.cancel}
                    </button>
                    <button
                        className="cta h-36 lh-36"
                        disabled={loader || !resourceYAML}
                        onClick={onSave}
                        data-testid="create-kubernetes-resource-button"
                    >
                        {loader ? <Progressing /> : CREATE_RESOURCE_MODAL_MESSAGING.actionButtonText.apply}
                    </button>
                </div>
            )
        } else {
            return (
                <div className="dc__border-top flexbox dc__content-space right p-16">
                    <button className="flex cta h-36 lh-36" onClick={showCodeEditor}>
                        <Edit className="icon-dim-16 mr-4" />
                        {CREATE_RESOURCE_MODAL_MESSAGING.actionButtonText.editYAML}
                    </button>
                    <button
                        className="cta cancel h-36 lh-36 mr-12"
                        type="button"
                        onClick={onClose}
                        data-testid="close-after-resource-creation"
                    >
                        {CREATE_RESOURCE_MODAL_MESSAGING.actionButtonText.close}
                    </button>
                </div>
            )
        }
    }

    const renderPageContent = (): JSX.Element => {
        if (loader) {
            return (
                <ResourceListEmptyState
                    imgSource={mechanicalOperation}
                    title={CREATE_RESOURCE_MODAL_MESSAGING.creatingObject.title}
                    subTitle={CREATE_RESOURCE_MODAL_MESSAGING.creatingObject.subTitle}
                />
            )
        } else if (showCodeEditorView) {
            return (
                <>
                    <InfoColourBar
                        message={CREATE_RESOURCE_MODAL_MESSAGING.infoMessage}
                        classname="info_bar dc__no-border-radius dc__no-top-border"
                        Icon={InfoIcon}
                    />
                    <CodeEditor
                        theme="vs-dark--dt"
                        value={resourceYAML}
                        mode={MODES.YAML}
                        noParsing
                        height={'calc(100vh - 165px)'}
                        onChange={handleEditorValueChange}
                        loading={loader}
                        focus={true}
                    />
                </>
            )
        } else {
            return (
                <div>
                    <div className="created-resource-row dc__border-bottom pt-8 pr-20 pb-8 pl-20">
                        {APP_STATUS_HEADERS.map((headerKey, index) => (
                            <div className="fs-13 fw-6 cn-7" key={`header_${index}`}>
                                {headerKey}
                            </div>
                        ))}
                    </div>
                    <div className="created-resource-list fs-13">
                        {resourceResponse?.map((resource) => (
                            <div
                                className="created-resource-row pt-8 pr-20 pb-8 pl-20"
                                key={`${resource.kind}/${resource.name}`}
                            >
                                <div className="dc__ellipsis-right">{resource.kind}</div>
                                <div className="dc__word-break">{resource.name}</div>
                                <div className="flexbox">
                                    {resource.error ? (
                                        <>
                                            <Error className="icon-dim-16 mt-3 mr-8" />
                                            {CreateResourceStatus.failed}
                                        </>
                                    ) : (
                                        <>
                                            <Success className="icon-dim-16 mt-3 mr-8" />
                                            {resource.isUpdate
                                                ? CreateResourceStatus.updated
                                                : CreateResourceStatus.created}
                                        </>
                                    )}
                                </div>
                                <div className="dc__word-break">{resource.error}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="create-resource-container bcn-0 h-100" ref={appStatusDetailRef}>
                <div className="flex flex-align-center flex-justify bcn-0 pt-16 pr-20 pb-16 pl-20 dc__border-bottom">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0">{CREATE_RESOURCE_MODAL_MESSAGING.title}</h2>
                    <button type="button" className="dc__transparent flex icon-dim-24" onClick={onClose}>
                        <CloseIcon className="icon-dim-24" />
                    </button>
                </div>
                <div style={{ height: 'calc(100vh - 127px)' }}>{renderPageContent()}</div>
                {renderFooter()}
            </div>
        </Drawer>
    )
}
