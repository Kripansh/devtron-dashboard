import React, { useState } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { showError, Progressing, VisibleModal, InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import GenerateActionButton from './GenerateActionButton'
import { getDateInMilliseconds } from './authorization.utils'
import { RegenerateModalType, TokenResponseType } from './authorization.type'
import { updateGeneratedAPIToken } from './service'
import GenerateModal from './GenerateModal'
import ExpirationDate from './ExpirationDate'

function RegeneratedModal({
    close,
    setShowRegeneratedModal,
    editData,
    customDate,
    setCustomDate,
    reload,
    redirectToTokenList,
}: RegenerateModalType) {
    const [loader, setLoader] = useState(false)
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const [selectedExpirationDate, setSelectedExpirationDate] = useState<{ label: string; value: any }>({
        label: '30 days',
        value: 30,
    })
    const [tokenResponse, setTokenResponse] = useState<TokenResponseType>()
    const [regeneratedExpireAtInMs, setRegeneratedExpireAtInMs] = useState<number>(
        getDateInMilliseconds(selectedExpirationDate.value),
    )
    const [invalidCustomDate, setInvalidCustomDate] = useState(false)

    const onChangeSelectFormData = (selectedOption: { label: string; value: any }) => {
        setRegeneratedExpireAtInMs(selectedOption.value === 0 ? 0 : getDateInMilliseconds(selectedOption.value))
        setSelectedExpirationDate(selectedOption)

        if (selectedOption.label === 'Custom' && invalidCustomDate) {
            setInvalidCustomDate(false)
        }
    }

    const handleDatesChange = (event): void => {
        setCustomDate(event)
        setRegeneratedExpireAtInMs(event.valueOf())

        if (invalidCustomDate) {
            setInvalidCustomDate(false)
        }
    }

    const renderModalHeader = () => {
        return (
            <div className="modal__header p-16 dc__border-bottom w-100 mb-0">
                <h2 className="modal__title fs-16 flex dc__content-space w-100">
                    <span>Regenerate API token</span>
                    <button type="button" className=" dc__transparent" onClick={close}>
                        <Close className="icon-dim-24" />
                    </button>
                </h2>
            </div>
        )
    }

    const handleRegenrateToken = async () => {
        if (selectedExpirationDate.label === 'Custom' && !customDate) {
            setInvalidCustomDate(true)
            return
        }

        setLoader(true)
        try {
            const payload = {
                description: editData.description,
                expireAtInMs: regeneratedExpireAtInMs,
            }

            const { result } = await updateGeneratedAPIToken(payload, editData.id)
            setTokenResponse(result)
            setShowGenerateModal(true)
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    if (loader) {
        return <Progressing pageLoader />
    }

    const handleGenerateTokenActionButton = () => {
        setShowRegeneratedModal(false)
        setShowGenerateModal(false)
    }

    return showGenerateModal ? (
        <GenerateModal
            close={handleGenerateTokenActionButton}
            token={tokenResponse.token}
            reload={reload}
            redirectToTokenList={redirectToTokenList}
            isRegenerationModal={true}
        />
    ) : (
        <VisibleModal className="regenerate-token-modal">
            <div className="modal__body w-600 flex column p-0">
                {renderModalHeader()}
                <div className="p-20 w-100">
                    <InfoColourBar
                        message="Submitting this form will generate a new token. Be aware that any scripts or applications using the current token will need to be updated."
                        classname="warn"
                        Icon={Warn}
                        iconClass="warning-icon"
                    />
                    <div className="mt-20 mb-20">
                        <ExpirationDate
                            selectedExpirationDate={selectedExpirationDate}
                            onChangeSelectFormData={onChangeSelectFormData}
                            handleDatesChange={handleDatesChange}
                            customDate={customDate}
                        />
                    </div>
                    {selectedExpirationDate.label === 'Custom' && invalidCustomDate && (
                        <span className="form__error flexbox-imp flex-align-center">
                            <Warn className="form__icon--error icon-dim-16 mr-4" />
                            Custom expiration can't be blank. Please select a date.
                        </span>
                    )}
                </div>
                <GenerateActionButton
                    loader={loader}
                    onCancel={() => setShowRegeneratedModal(false)}
                    onSave={handleRegenrateToken}
                    buttonText="Regenerate Token"
                    regenerateButton={true}
                />
            </div>
        </VisibleModal>
    )
}

export default RegeneratedModal
