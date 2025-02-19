import React, { useEffect, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentAppType } from '../../../v2/appDetails/appDetails.type'
import { getDeploymentStatusDetail } from '../appDetails/appDetails.service'
import { DeploymentStatusDetailsBreakdownDataType } from '../appDetails/appDetails.type'
import DeploymentStatusDetailBreakdown from '../appDetails/DeploymentStatusBreakdown'
import { processDeploymentStatusDetailsData } from '../appDetails/utils'
import { DeploymentDetailStepsType } from './cd.type'
import CDEmptyState from './CDEmptyState'
import mechanicalOperation from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as Arrow } from '../../../../assets/icons/ic-arrow-forward.svg'
import { DEPLOYMENT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM, TIMELINE_STATUS, URLS } from '../../../../config'

export default function DeploymentDetailSteps({ deploymentStatus, deploymentAppType }: DeploymentDetailStepsType) {
    const history = useHistory()
    const { url } = useRouteMatch()
    const { appId, envId, triggerId } = useParams<{ appId: string; envId?: string; triggerId?: string }>()
    const [deploymentListLoader, setDeploymentListLoader] = useState<boolean>(deploymentStatus.toUpperCase() !== TIMELINE_STATUS.ABORTED)
    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>(processDeploymentStatusDetailsData())

    let initTimer = null
    const getDeploymentDetailStepsData = (): void => {
        getDeploymentStatusDetail(appId, envId, triggerId)
            .then((deploymentStatusDetailRes) => {
                const processedDeploymentStatusDetailsData = processDeploymentStatusDetailsData(
                    deploymentStatusDetailRes.result,
                )
                if (processedDeploymentStatusDetailsData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS) {
                    initTimer = setTimeout(() => {
                        getDeploymentDetailStepsData()
                    }, 10000)
                }
                setDeploymentStatusDetailsBreakdownData(processedDeploymentStatusDetailsData)
                setDeploymentListLoader(false)
            })
            .catch((e) => {
                setDeploymentListLoader(false)
            })
    }

    useEffect(() => {
        if (deploymentAppType === DeploymentAppType.helm) {
            history.replace(`${url.replace('deployment-steps', 'source-code')}`)
            if (initTimer) {
                clearTimeout(initTimer)
            }
            return
        }
        if (deploymentStatus !== 'Aborted') {
            getDeploymentDetailStepsData()
        }
        return (): void => {
            if (initTimer) {
                clearTimeout(initTimer)
            }
        }
    }, [])

    const redirectToDeploymentStatus = () => {
        history.push({
            pathname: `${URLS.APP}/${appId}/${URLS.APP_DETAILS}/${envId}/${URLS.APP_DETAILS_K8}`,
            search: DEPLOYMENT_STATUS_QUERY_PARAM
        })
    }

    return deploymentStatus.toUpperCase() === TIMELINE_STATUS.ABORTED ||
        deploymentStatusDetailsBreakdownData.deploymentStatus === DEPLOYMENT_STATUS.SUPERSEDED ? (
        <div className="flexbox deployment-aborted" data-testid="deployment-history-steps-failed-message">
            <CDEmptyState
                title="Deployment failed"
                subtitle="A new deployment was initiated before this deployment completed."
            />
        </div>
    ) : deploymentListLoader ? (
        <Progressing pageLoader />
    ) : !deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.isCollapsed ? (
        <div className="h-100 flex">
            <CDEmptyState
                title="Deployment in progress"
                imgSource={mechanicalOperation}
                actionButtonClass="bcb-5 cn-0"
                ActionButtonIcon={Arrow}
                actionHandler={redirectToDeploymentStatus}
                subtitle="This deployment is in progress. Click on Check status to know the live status."
                actionButtonText="Check live status"
                actionButtonIconRight={true}
                dataTestId="deployment-progress"
            />
        </div>
    ) : (
        <div className="dc__mxw-1000 min-w-800">
            <DeploymentStatusDetailBreakdown
                deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                streamData={null}
            />
        </div>
    )
}
