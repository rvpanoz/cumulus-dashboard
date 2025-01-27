import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown as DropdownBootstrap } from 'react-bootstrap';
import moment from 'moment';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ErrorReport from '../Errors/report';

/**
 * ReportHeading
 * @description Reusable heading for all report types
 */

const ReportHeading = ({
  downloadOptions,
  conflictComparisons,
  endTime,
  error,
  name,
  onDownloadClick,
  startTime,
  type,
}) => {
  const breadcrumbConfig = [
    {
      label: 'Dashboard Home',
      href: '/',
    },
    {
      label: 'Reports',
      href: '/reconciliation-reports',
    },
    {
      label: name,
      active: true,
    },
  ];

  const formattedStartTime = startTime
    ? moment(startTime).utc().format('YYYY-MM-DD H:mm:ss')
    : 'missing';

  const formattedEndTime = endTime
    ? moment(endTime).utc().format('YYYY-MM-DD H:mm:ss')
    : 'missing';
  return (
    <>
      <section className="page__section page__section__controls">
        <div className="reconciliation-reports__options--top">
          <ul>
            <li key="breadcrumbs">
              <Breadcrumbs config={breadcrumbConfig} />
            </li>
          </ul>
        </div>
      </section>
      <section className="page__section page__section__header-wrapper">
        <div className="page__section__header">
          <div className="heading--shared-content with-description with-bottom-border width--full">
            <ul>
              <li>
                <h1 className="heading--large heading--shared-content with-description">
                  {type && `${type} Report: `}
                  {name}
                </h1>
              </li>
              <li>
                {downloadOptions && (
                  <DropdownBootstrap className="form-group__element--right">
                    <DropdownBootstrap.Toggle
                      className="button button--small button--download"
                      id="download-report-dropdown"
                    >
                      Download Report
                    </DropdownBootstrap.Toggle>
                    <DropdownBootstrap.Menu>
                      {downloadOptions.map(({ label, onClick }, index) => (
                        <DropdownBootstrap.Item
                          key={index}
                          as="button"
                          onClick={onClick}
                        >
                          {label}
                        </DropdownBootstrap.Item>
                      ))}
                    </DropdownBootstrap.Menu>
                  </DropdownBootstrap>
                )}
                {onDownloadClick && (
                  <button
                    className="form-group__element--right button button--small button--download"
                    onClick={onDownloadClick}
                  >
                    Download Report
                  </button>
                )}
                {error && <ErrorReport report={error} />}
              </li>
              <li>
                <span className="font-weight-bold heading--description">Date Range:</span>{' '}
                {formattedStartTime} to {formattedEndTime}
              </li>
            </ul>
          </div>
          <div className="with-description">
            {
              {
                Inventory:
                  'The reports below compare datasets and display the conflicts in each data location.',
                'Granule Not Found':
                  'The report below shows a comparison across each data bucket/repository for granule issues.',
              }[type]
            }
          </div>
        </div>
      </section>
      <section>
        <div>
          {conflictComparisons && (
            <h2 className="heading--medium heading--shared-content heading__wrapper--border width--full">
              Total Conflict Comparisons
              <span className="num-title">{conflictComparisons}</span>
            </h2>
          )}
        </div>
      </section>
    </>
  );
};

ReportHeading.propTypes = {
  conflictComparisons: PropTypes.number,
  /**
   * Create dropdown for downloading multiple tables using these options
   */
  downloadOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
  endTime: PropTypes.string,
  error: PropTypes.string,
  name: PropTypes.string,
  /**
   * Create button for single download
   */
  onDownloadClick: PropTypes.func,
  startTime: PropTypes.string,
  type: PropTypes.string,
};

export default ReportHeading;
