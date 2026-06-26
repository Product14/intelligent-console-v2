import DateFilter from './dateFilter/dateFilter';
import Range from './range/range';
import Search from './select/search';
import Select from './select/select';
import SelectOne from './select/selectOne';

export const renderAdvanceFilters = {
  ['search&select']: (columnHeader, close) => (
    <Select columnHeader={columnHeader} close={close} />
  ),
  select: (columnHeader, close) => (
    <Select columnHeader={columnHeader} close={close} />
  ),
  date: (columnHeader, close) => (
    <DateFilter columnHeader={columnHeader} close={close} />
  ),
  range: (columnHeader, close) => (
    <Range columnHeader={columnHeader} close={close} />
  ),
  ['search&selectOne']: (columnHeader, close) => (
    <SelectOne columnHeader={columnHeader} close={close} />
  ),
  selectOne: (columnHeader, close) => (
    <SelectOne columnHeader={columnHeader} close={close} />
  ),
};
