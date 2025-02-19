import React, { useContext } from 'react'
import { FormErrorObjectType, FormType, MountPathMap } from '../ciPipeline/types'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ciPipelineContext } from './CIPipeline'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'

function MountFromHost() {
    const {
        selectedTaskIndex,
        formData,
        setFormData,
        activeStageName,
        formDataErrorObj,
    }: {
        selectedTaskIndex: number
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        activeStageName: string
        formDataErrorObj: FormErrorObjectType
    } = useContext(ciPipelineContext)
    const addMountDirectoryfromHost = () => {
        const _formData = { ...formData }

        if (!_formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap = []
        }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap.unshift({
            filePathOnDisk: '',
            filePathOnContainer: '',
        })
        setFormData(_formData)
    }

    const deleteMountPath = (index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap.splice(index, 1)
        setFormData(_formData)
    }
    const handleMountPath = (e, index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap[index][e.target.name] =
            e.target.value
        setFormData(_formData)
    }

    return (
        <>
            <div className="row-container mb-12">
                <div className="fw-6 fs-13 lh-32 cn-7 "></div>
                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32" onClick={addMountDirectoryfromHost}>
                    <Add className="add-icon mt-6" />
                    Add mapping
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap?.map(
                (mountPathMap, index) => {
                    const errorObj =
                        formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail?.mountPathMap?.[
                            index
                        ]
                    return (
                        <>
                            <div className="mount-row mb-4 mt-4">
                                <div className="fw-6 fs-13 lh-32 cn-7 "></div>
                                <input
                                    data-testid="script-mount-host-file-path-host"
                                    className="bcn-1 en-2 bw-1 pl-10 pr-10 pt-6 pb-6 dc__left-radius-4 dc__no-right-border"
                                    autoComplete="off"
                                    placeholder="File path on Host"
                                    type="text"
                                    onChange={(e) => handleMountPath(e, index)}
                                    value={mountPathMap[MountPathMap.FILEPATHONDISK]}
                                    name={MountPathMap.FILEPATHONDISK}
                                />
                                <div className="flex bw-1 en-2">:</div>
                                <input
                                    data-testid="script-mount-host-file-path-container"
                                    className="bcn-1 en-2 bw-1 pl-10 pr-10 pt-6 pb-6 dc__right-radius-4 dc__no-left-border"
                                    autoComplete="off"
                                    placeholder="File path on container"
                                    type="text"
                                    onChange={(e) => handleMountPath(e, index)}
                                    value={mountPathMap[MountPathMap.FILEPATHONCONTAINER]}
                                    name={MountPathMap.FILEPATHONCONTAINER}
                                />
                                <Close
                                    className="icon-dim-24 pointer mt-6 ml-6"
                                    onClick={() => {
                                        deleteMountPath(index)
                                    }}
                                />
                            </div>
                            <div className="pl-220">
                                {errorObj && !errorObj.isValid && (
                                    <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                        <span>{errorObj.message}</span>
                                    </span>
                                )}
                            </div>
                        </>
                    )
                },
            )}
        </>
    )
}

export default MountFromHost
