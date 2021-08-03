// This is the main Collections Overview page
import { get } from 'object-path';
import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  applyRecoveryWorkflowToCollection,
  clearCollectionsSearch,
  getCumulusInstanceMetadata,
  getOptionsProviderName,
  listCollections,
  searchCollections,
  filterCollections,
  clearCollectionsFilter,
} from '../../actions';
import { lastUpdated, tally, getCollectionId } from '../../utils/format';
import {
  bulkActions,
  recoverAction,
  tableColumns,
} from '../../utils/table-config/collections';
import Dropdown from '../DropDown/dropdown';
import Search from '../Search/search';
import List from '../Table/Table';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ListFilters from '../ListActions/ListFilters';
const sortState = List.initialSortBy === [] ? 'duration' : List.initialSortBy;
const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/',
  },
  {
    label: 'Collections',
    active: true,
  },
];

class CollectionList extends React.Component {
  constructor() {
    super();
    this.generateQuery = this.generateQuery.bind(this);
    this.generateBulkActions = this.generateBulkActions.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getCumulusInstanceMetadata());
  }

  generateQuery() {
    const { queryParams } = this.props;
    return { ...queryParams };
  }

  generateBulkActions() {
    const actionConfig = {
      recover: {
        action: applyRecoveryWorkflowToCollection,
      },
    };
    const { collections, config } = this.props;
    let actions = bulkActions(collections);
    if (config.enableRecovery) {
      actions = actions.concat(recoverAction(collections, actionConfig));
    }
    return actions;
  }

  render() {
    const { collections, datepicker, providers: { dropdowns } } = this.props;
    const { list } = collections;
    const { startDateTime, endDateTime } = datepicker || {};
    const hasTimeFilter = startDateTime || endDateTime;

    const { count, queriedAt } = list.meta;
    return (
      <div className="page__component">
        <Helmet>
          <title> Collections </title>
        </Helmet>
        <section className="page__section">
          <section className="page__section page__section__controls">
            <Breadcrumbs config={breadcrumbConfig} />
          </section>
          <div className="page__section__header page__section__header-wrapper">
            <h1 className="heading--large heading--shared-content with-description">
              {strings.collection_overview}
            </h1>
            {lastUpdated(queriedAt)}
          </div>
        </section>
        <section className="page__section">
          <div className="heading__wrapper--border">
            <h2 className="heading--medium heading--shared-content with-description">
              {hasTimeFilter
                ? strings.active_collections
                : strings.all_collections}
              <span className="num-title">{count ? tally(count) : 0}</span>
            </h2>
          </div>

          <List
            list={list}
            tableColumns={tableColumns}
            action={listCollections}
            query={this.generateQuery()}
            bulkActions={this.generateBulkActions()}
            rowId={getCollectionId}
            initialSortId= {sortState}
            filterAction={filterCollections}
            filterClear={clearCollectionsFilter}
            tableID = {'CollectionsTable'}
          >
            <Search
              action={searchCollections}
              clear={clearCollectionsSearch}
              label="Search"
              labelKey="name"
              placeholder="Collection Name"
              searchKey="collections"
            />
            <ListFilters>
              <Dropdown
                getOptions={getOptionsProviderName}
                options={get(dropdowns, ['provider', 'options'])}
                action={filterCollections}
                clear={clearCollectionsFilter}
                paramKey="provider"
                label="Provider"
                inputProps={{
                  placeholder: 'All',
                  className: 'dropdown--medium',
                }}
              />
            </ListFilters>
          </List>
        </section>
      </div>
    );
  }
}

CollectionList.propTypes = {
  collections: PropTypes.object,
  config: PropTypes.object,
  datepicker: PropTypes.object,
  dispatch: PropTypes.func,
  providers: PropTypes.object,
  queryParams: PropTypes.object,
};

CollectionList.displayName = 'CollectionList';

export { CollectionList };
export default withRouter(
  connect((state) => ({
    collections: state.collections,
    config: state.config,
    datepicker: state.datepicker,
    providers: state.providers,
  }))(CollectionList)
);
