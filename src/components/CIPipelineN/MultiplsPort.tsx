import React, { useContext } from 'react'
import { FormType, PortMap, TaskFieldDescription, TaskFieldLabel } from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ciPipelineContext } from './CIPipeline'
import TaskFieldTippyDescription from './TaskFieldTippyDescription'

function MultiplePort() {
    const {
        selectedTaskIndex,
        formData,
        setFormData,
        activeStageName,
    }: {
        selectedTaskIndex: number
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        activeStageName: string
    } = useContext(ciPipelineContext)
    const addMultiplePort = (): void => {
        const _formData = { ...formData }

        if (!_formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap = []
        }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap.unshift({
            portOnLocal: '',
            portOnContainer: '',
        })
        setFormData(_formData)
    }

    const handlePort = (e, index) => {
        const _formData = { ...formData }
        e.target.value = e.target.value.replace(/\D/g, '')
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap[index][e.target.name] =
            e.target.value && Number(e.target.value)
        setFormData(_formData)
    }

    const deleteMultiplePort = (index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap.splice(index, 1)
        setFormData(_formData)
    }

    return (
        <div className="mb-12">
            <div className="row-container">
                <TaskFieldTippyDescription
                    taskField={TaskFieldLabel.PORTMAPPING}
                    contentDescription={TaskFieldDescription.PORTMAPPING}
                />
                <div
                    data-testid="custom-script-container-image-add-port-button"
                    className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32"
                    onClick={addMultiplePort}
                >
                    <Add className="add-icon mt-6" />
                    Add port
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap?.map((elm, index) => {
                return (
                    elm[PortMap.PORTONLOCAL] !== 0 &&
                    elm[PortMap.PORTONCONTAINER] !== 0 && (
                        <div className="custom-input__port-map pl-220 mt-8" key={`multiple-port-${index}`}>
                            <input
                                data-testid="custom-script-container-image-host-port-textbox"
                                style={{ width: '80% !important' }}
                                className="w-100 bcn-1 dc__border dc__left-radius-4 pl-10 pr-10 pt-5 pb-5"
                                autoComplete="off"
                                placeholder="Host port"
                                type="text"
                                onChange={(e) => handlePort(e, index)}
                                name={PortMap.PORTONLOCAL}
                                value={elm[PortMap.PORTONLOCAL]}
                                maxLength={5}
                            />
                            <div className="flex dc__border-top dc__border-bottom">:</div>
                            <input
                                data-testid="custom-script-container-image-container-port-textbox"
                                style={{ width: '80% !important' }}
                                className="w-100 bcn-1 dc__border dc__right-radius-4 pl-10 pr-10 pt-5 pb-5"
                                autoComplete="off"
                                placeholder="Container port"
                                type="text"
                                onChange={(e) => handlePort(e, index)}
                                name={PortMap.PORTONCONTAINER}
                                value={elm[PortMap.PORTONCONTAINER]}
                                maxLength={5}
                            />
                            <Close
                                className="icon-dim-24 pointer mt-6 ml-6"
                                onClick={() => {
                                    deleteMultiplePort(index)
                                }}
                            />
                        </div>
                    )
                )
            })}
        </div>
    )
}

export default MultiplePort
