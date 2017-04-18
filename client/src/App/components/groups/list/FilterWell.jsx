import React from 'react';
import { Well, Row, Col } from 'react-bootstrap';
import Multiselect from 'react-bootstrap-multiselect';
import 'react-bootstrap-multiselect/css/bootstrap-multiselect.css';
import {
    daysOfTheWeek
} from '../../../constants';
const FilterElement = ({ label, children }) => {
    return (
        <Row>
            <Col md={4}>
                <label className="control-label">{label}</label>
            </Col>
            <Col md={8}>
                {children}
            </Col>
        </Row>
    );
};

class FilterWell extends React.Component {
    constructor(props) {
        super(props);
        this.doFilter = this.doFilter.bind(this);
        this.daysOfTheWeekOptions = daysOfTheWeek.map(d => {
            return { value: d };
        });
        this.dotwChecked = [];
        this.filters = new Map();


    }
    doFilter(key, filterValue) {

        let filterdGroups = this.props.groups || [];
        // if a key is passed along with an empty value, then we need to delete that filter
        if (!filterValue || (filterValue && filterValue.length == 0)) {
            this.filters.delete(key);
        }
        // if the filter is matching an array --
        else if (Array.isArray(filterValue)) {
            this.filters.set(key, key => g => {

                return filterValue.filter(element => g[key].toLowerCase() === element.toLowerCase()).length > 0;
            });
        }
        // if the filter is a string    
        else if (filterValue.length > 0) {
            this.filters.set(key, key => g => g[key].toLowerCase().includes(filterValue.toLowerCase()));
        }

        // apply all filters
        this.filters.forEach((value, key) => {
            filterdGroups = filterdGroups.filter(value(key));
        });


        this.props.updateFilter(filterdGroups);

    }

    render() {
        let dotwChecked = this.dotwChecked;
        return (<Well>
            <Row>
                <div className="h3">Filter The Groups By:</div>
            </Row>
            <FilterElement label="Title">
                <input name="titleFilter" placeholder="Filter Title" type="text" autoComplete="off" className="form-control" onChange={(e) => {
                    this.doFilter('title', e.target.value);
                }} />
            </FilterElement>
            <FilterElement label="Location">
                <input name="locationFilter" placeholder="Filter Location" type="text" autoComplete="off" className="form-control" onChange={(e) => {
                    this.doFilter('location', e.target.value);
                }} />
            </FilterElement>
            <FilterElement label="Day">
                <Multiselect
                    onChange={(option, checked) => {
                        // if the checkbox is being checked, and its not already in the list, then add it
                        if (checked && !dotwChecked.includes(option.val())) {
                            dotwChecked.push(option.val());

                        }
                        // otherwise, we are removing it
                        else {
                            dotwChecked = dotwChecked.filter(day => day !== option.val());
                        }
                        this.doFilter('dayOfTheWeek', dotwChecked);

                    }}
                    data={this.daysOfTheWeekOptions} multiple />

            </FilterElement>
        </Well>);
    }
}
export default FilterWell;