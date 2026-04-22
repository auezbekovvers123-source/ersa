import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    productSearch: '',
    operationsCount: 0,
  },
  reducers: {
    setProductSearch(state, action) {
      state.productSearch = action.payload ?? ''
    },
    bumpOperationsCount(state) {
      state.operationsCount += 1
    },
  },
})

export const { setProductSearch, bumpOperationsCount } = uiSlice.actions
export default uiSlice.reducer
