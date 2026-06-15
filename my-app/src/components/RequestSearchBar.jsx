import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';

/**
 * RequestSearchBar Component
 * Provides search and filter functionality for request lists
 *
 * @param {Array} requests - Array of requests to filter
 * @param {Function} onFiltered - Callback with filtered results
 * @param {Object} filterOptions - Configuration for available filters
 *   - allowSearch: boolean (search by name/ID)
 *   - allowStatusFilter: boolean (filter by status)
 *   - allowYearFilter: boolean (filter by academic year)
 *   - allowSemesterFilter: boolean (filter by semester)
 *   - statusOptions: array of status values
 */
function RequestSearchBar({
  requests = [],
  onFiltered,
  filterOptions = {
    allowSearch: true,
    allowStatusFilter: true,
    allowYearFilter: false,
    allowSemesterFilter: false,
    statusOptions: ['Pending', 'In Progress', 'Completed', 'Rejected'],
  },
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Get unique academic years and semesters from requests
  const uniqueYears = useMemo(() => {
    return Array.from(new Set(requests.map((r) => r.academicYear))).sort().reverse();
  }, [requests]);

  const uniqueSemesters = useMemo(() => {
    return Array.from(new Set(requests.map((r) => r.semester))).sort();
  }, [requests]);

  // Filter and sort logic
  useMemo(() => {
    let filtered = [...requests];

    // Text search (name or student ID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          (req.User?.name && req.User.name.toLowerCase().includes(query)) ||
          (req.studentId && req.studentId.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Academic year filter
    if (yearFilter) {
      filtered = filtered.filter((req) => req.academicYear === yearFilter);
    }

    // Semester filter
    if (semesterFilter) {
      filtered = filtered.filter((req) => req.semester === semesterFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Call callback with filtered results
    if (onFiltered) {
      onFiltered(filtered);
    }
  }, [searchQuery, statusFilter, yearFilter, semesterFilter, sortBy, requests, onFiltered]);

  // Check if any filter is applied
  const hasActiveFilters = searchQuery || statusFilter || yearFilter || semesterFilter;

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setYearFilter('');
    setSemesterFilter('');
    setSortBy('newest');
  };

  return (
    <Box
      sx={{
        p: 2.5,
        backgroundColor: '#f8fafc',
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FilterListIcon sx={{ color: '#64748b', fontSize: 20 }} />
        <span style={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>ค้นหาและกรอง</span>
      </Box>

      {/* Filter Controls */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        {/* Search Input */}
        {filterOptions.allowSearch && (
          <TextField
            placeholder="ค้นหาชื่อ หรือ รหัสนิสิต..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                '&:hover fieldset': { borderColor: '#cbd5e1' },
              },
            }}
          />
        )}

        {/* Status Filter */}
        {filterOptions.allowStatusFilter && (
          <FormControl size="small" sx={{ minWidth: '100%' }}>
            <InputLabel sx={{ fontSize: '14px' }}>สถานะ</InputLabel>
            <Select
              label="สถานะ"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ backgroundColor: '#ffffff' }}
            >
              <MenuItem value="">
                <em>ทั้งหมด</em>
              </MenuItem>
              {filterOptions.statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Year Filter */}
        {filterOptions.allowYearFilter && uniqueYears.length > 0 && (
          <FormControl size="small" sx={{ minWidth: '100%' }}>
            <InputLabel sx={{ fontSize: '14px' }}>ปีการศึกษา</InputLabel>
            <Select
              label="ปีการศึกษา"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              sx={{ backgroundColor: '#ffffff' }}
            >
              <MenuItem value="">
                <em>ทั้งหมด</em>
              </MenuItem>
              {uniqueYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Semester Filter */}
        {filterOptions.allowSemesterFilter && uniqueSemesters.length > 0 && (
          <FormControl size="small" sx={{ minWidth: '100%' }}>
            <InputLabel sx={{ fontSize: '14px' }}>ภาคเรียน</InputLabel>
            <Select
              label="ภาคเรียน"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              sx={{ backgroundColor: '#ffffff' }}
            >
              <MenuItem value="">
                <em>ทั้งหมด</em>
              </MenuItem>
              {uniqueSemesters.map((sem) => (
                <MenuItem key={sem} value={sem}>
                  ภาคเรียนที่ {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: '100%' }}>
          <InputLabel sx={{ fontSize: '14px' }}>เรียงลำดับ</InputLabel>
          <Select
            label="เรียงลำดับ"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ backgroundColor: '#ffffff' }}
          >
            <MenuItem value="newest">ใหม่ที่สุด</MenuItem>
            <MenuItem value="oldest">เก่าที่สุด</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>ตัวกรองที่ใช้งาน:</span>
          {searchQuery && (
            <Chip
              label={`ค้นหา: ${searchQuery}`}
              onDelete={() => setSearchQuery('')}
              size="small"
              sx={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
            />
          )}
          {statusFilter && (
            <Chip
              label={`สถานะ: ${statusFilter}`}
              onDelete={() => setStatusFilter('')}
              size="small"
              sx={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
            />
          )}
          {yearFilter && (
            <Chip
              label={`ปีการศึกษา: ${yearFilter}`}
              onDelete={() => setYearFilter('')}
              size="small"
              sx={{ backgroundColor: '#fef3c7', color: '#854d0e' }}
            />
          )}
          {semesterFilter && (
            <Chip
              label={`ภาคเรียนที่: ${semesterFilter}`}
              onDelete={() => setSemesterFilter('')}
              size="small"
              sx={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }}
            />
          )}
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            sx={{
              textTransform: 'none',
              color: '#ef4444',
              fontSize: '12px',
              ml: 1,
            }}
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default RequestSearchBar;
