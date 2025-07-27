"use client";
import React, { useId } from 'react';
import Select from 'react-select';
import { popularTickers, getCompanyNameFromTicker } from '@/lib/ticker-utils';

const options = popularTickers.map(ticker => ({
    value: ticker,
    label: `${ticker} - ${getCompanyNameFromTicker(ticker)}`
}));

interface CompanySelectorProps {
  onTickerSelect: (ticker: string) => void;
  selectedTicker: string;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ onTickerSelect, selectedTicker }) => {
  const selectedOption = options.find(option => option.value === selectedTicker);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      background: '#0f172a',
      border: '1px solid #4a5568',
      borderRadius: '8px',
      padding: '6px',
      color: '#f1f5f9',
      minHeight: '50px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#a0aec0',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      background: '#0f172a',
      border: '1px solid #4a5568',
      borderRadius: '8px',
      color: '#f1f5f9',
      zIndex: 9999,
    }),
    menuList: (provided: any) => ({
        ...provided,
        maxHeight: '200px',
    }),
    option: (provided: any, state: { isFocused: any; isSelected: any; }) => ({
      ...provided,
      background: state.isFocused ? '#1e293b' : 'transparent',
      color: state.isSelected ? '#22c55e' : '#f1f5f9',
      '&:active': {
        background: '#4a5568',
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#f1f5f9',
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#f1f5f9',
    }),
  };

  return (
    <Select
      instanceId={useId()}
      value={selectedOption}
      onChange={(option) => onTickerSelect(option ? option.value : '')}
      options={options}
      styles={customStyles}
      placeholder="Select or search for a ticker..."
    />
  );
};

export default CompanySelector; 