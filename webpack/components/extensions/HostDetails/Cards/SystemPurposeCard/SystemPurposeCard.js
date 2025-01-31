import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { STATUS } from 'foremanReact/constants';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListDescription,
  DescriptionListTerm,
  Flex,
  FlexItem,
  GridItem,
  Label,
  List,
  ListItem,
  Tooltip,
  Skeleton,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { translate as __ } from 'foremanReact/common/I18n';
import { propsToCamelCase } from 'foremanReact/common/helpers';
import './SystemPurposeCard.scss';
import SystemPurposeEditModal from './SystemPurposeEditModal';
import { selectHostDetailsStatus } from '../../HostDetailsSelectors';
import { hasRequiredPermissions, hostIsNotRegistered } from '../../hostDetailsHelpers';

const SystemPurposeCard = ({ hostDetails }) => {
  const showEditButton = hasRequiredPermissions(['edit_hosts'], hostDetails?.permissions);
  const { organization_id: orgId, name: hostName } = hostDetails;
  const subscriptionFacetAttributes = hostDetails?.subscription_facet_attributes;
  const {
    purposeRole, purposeUsage, purposeAddons, releaseVersion, serviceLevel,
  } = propsToCamelCase(subscriptionFacetAttributes ?? {});
  const sysPurposeProps = {
    purposeRole,
    purposeUsage,
    purposeAddons,
    releaseVersion,
    serviceLevel,
  };
  const hostDetailsStatus = useSelector(selectHostDetailsStatus);
  const dataIsLoading = hostDetailsStatus === STATUS.PENDING;

  const [editing, setEditing] = useState(false);
  if (!hostDetails?.id) {
    return (
      <GridItem rowSpan={1} md={6} lg={4} xl2={3}>
        <Card ouiaId="system-purpose-card">
          <Skeleton />
        </Card>
      </GridItem>
    );
  }

  if (hostIsNotRegistered({ hostDetails })) return null;

  return (
    <GridItem rowSpan={1} md={6} lg={4} xl2={3}>
      <Card ouiaId="system-purpose-card">
        <CardHeader>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            style={{ width: '100%' }}
          >
            <FlexItem>
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
              >
                <FlexItem style={{ marginRight: '0.5em' }}>
                  <CardTitle>{__('System purpose')}</CardTitle>
                </FlexItem>
                <FlexItem>
                  <Tooltip
                    content={__('System purpose enables you to set the system\'s intended use on your network and improves reporting accuracy in the Subscriptions service of the Red Hat Hybrid Cloud Console.')}
                    position="top"
                    enableFlip
                    isContentLeftAligned
                  >
                    <OutlinedQuestionCircleIcon style={{ marginTop: '7px' }} color="gray" />
                  </Tooltip>
                </FlexItem>
              </Flex>
            </FlexItem>
            {showEditButton && (
              <FlexItem>
                <Button variant="link" isSmall ouiaId="syspurpose-edit-button" onClick={() => setEditing(val => !val)}>{__('Edit')}</Button>
              </FlexItem>)
            }
          </Flex>
        </CardHeader>
        <CardBody className="system-purpose-card-body">
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>{__('Role')}</DescriptionListTerm>
              <DescriptionListDescription>
                {dataIsLoading ? <Skeleton /> : purposeRole}
              </DescriptionListDescription>
              <DescriptionListTerm>{__('SLA')}</DescriptionListTerm>
              <DescriptionListDescription>
                {serviceLevel && (dataIsLoading ? <Skeleton /> : (
                  <Label color="blue">{serviceLevel}</Label>
                ))}
              </DescriptionListDescription>
              <DescriptionListTerm>{__('Usage type')}</DescriptionListTerm>
              <DescriptionListDescription>
                {purposeUsage && (dataIsLoading ? <Skeleton /> : (
                  <Label color="blue">{purposeUsage}</Label>
                ))}
              </DescriptionListDescription>
              <DescriptionListTerm>{__('Release version')}</DescriptionListTerm>
              <DescriptionListDescription>
                {dataIsLoading ? <Skeleton /> : releaseVersion}
              </DescriptionListDescription>
              {!!purposeAddons?.length && (
                <>
                  <DescriptionListTerm>{__('Add-ons')}</DescriptionListTerm>
                  {dataIsLoading ? <Skeleton /> : (
                    <DescriptionListDescription>
                      <List isPlain>
                        {purposeAddons.map(addon => (
                          <ListItem key={addon}>{addon}</ListItem>
                        ))}
                      </List>
                    </DescriptionListDescription>
                  )}
                </>
              )
              }
            </DescriptionListGroup>
          </DescriptionList>
          {showEditButton && (
            <SystemPurposeEditModal
              key={hostName}
              isOpen={editing}
              orgId={orgId}
              closeModal={() => setEditing(false)}
              hostName={hostName}
              hostId={hostDetails.id}
              {...sysPurposeProps}
            />
          )}
        </CardBody>
      </Card>
    </GridItem>
  );
};

SystemPurposeCard.propTypes = {
  hostDetails: PropTypes.shape({
    name: PropTypes.string,
    organization_id: PropTypes.number,
    id: PropTypes.number,
    subscription_facet_attributes: PropTypes.shape({
      installed_products: PropTypes.arrayOf(PropTypes.shape({
        productId: PropTypes.string,
        productName: PropTypes.string,
      })),
    }),
    permissions: PropTypes.shape({
      edit_hosts: PropTypes.bool,
    }),
  }),
};

SystemPurposeCard.defaultProps = {
  hostDetails: {},
};

export default SystemPurposeCard;
