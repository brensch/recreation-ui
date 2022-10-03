import algoliasearch, { SearchClient } from "algoliasearch/lite"
import {
  InstantSearch,
  RefinementListProps,
} from "react-instantsearch-hooks-web"
import { useSearchBox } from "react-instantsearch-hooks-web"
import { useEffect } from "react"
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import StepContent from "@mui/material/StepContent"
import CardMedia from "@mui/material/CardMedia"
import Stack from "@mui/material/Stack"
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline"
import GradeIcon from "@mui/icons-material/Grade"
import InputLabel from "@mui/material/InputLabel"
import InputAdornment from "@mui/material/InputAdornment"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import SearchIcon from "@mui/icons-material/Search"
import IconButton from "@mui/material/IconButton"
import FormLabel from "@mui/material/FormLabel"
import FormControl from "@mui/material/FormControl"
import FormGroup from "@mui/material/FormGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormHelperText from "@mui/material/FormHelperText"
import Checkbox from "@mui/material/Checkbox"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import { brownTheme } from "../App"
import { createTheme, ThemeProvider } from "@mui/material/styles"

import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridSortDirection,
  GridSortModel,
} from "@mui/x-data-grid"
import {
  useHits,
  useInstantSearch,
  UseHitsProps,
  UseSearchBoxProps,
  useRefinementList,
  UseRefinementListProps,
  useCurrentRefinements,
  RefinementList as Sendo,
} from "react-instantsearch-hooks-web"
import { Configure, Highlight, Pagination } from "react-instantsearch-hooks-web"
import TextField from "@mui/material/TextField"
import { Typography } from "@mui/material"
import React, { useContext, useState } from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"

import Grid from "@mui/material/Grid"
import { useNavigate } from "react-router-dom"

function Hits(props: UseHitsProps) {
  const [loading, setLoading] = useState(true)
  const { hits } = useHits(props)

  let navigate = useNavigate()

  // this is to avoid the awkward stutter as hits load for the first time
  useEffect(() => {
    if (!loading) return
    if (hits.length > 0) setLoading(false)
  }, [hits])

  if (loading) return <div />

  return (
    <DataGrid
      autoHeight
      rows={hits as unknown as Hit[]}
      columns={columns}
      hideFooterPagination
      getRowHeight={() => 100}
      onRowClick={(row) => {
        navigate(`/setup/${window.btoa(row.id as string)}`)
        // console.log(window.btoa(row.id as string))
      }}
      // sortModel={sortModel}
      // onSortModelChange={setSortModel}
      getRowId={(row: Hit) => row.objectID}
      components={{
        NoRowsOverlay: CustomNoRowsOverlay,
      }}
      onSelectionModelChange={(selection: GridRowId[]) => {
        if (selection.length === 0) {
          return
        }

        // navigate(`/schniff/${selection[0]}`)
      }}
      sx={{
        borderColor: "transparent",
        "& .MuiDataGrid-iconSeparator": {
          display: "none",
        },
        "& .MuiDataGrid-cell": {
          borderBottom: `1px solid ${"#000000"}`,
        },
        "& .MuiDataGrid-columnHeaders": {
          borderBottom: `2px solid ${"#000000"}`,
          display: "none",
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: `2px solid ${"#000000"}`,
        },
        "& .MuiDataGrid-virtualScroller": { marginTop: "0!important" },
      }}
    />
  )
}

// https://github.com/algolia/react-instantsearch/issues/3542
interface WidgetUiStateProviderProps {
  indexName: string
  children: JSX.Element
  searchClient: SearchClient
}

interface StateChangeHandleProps {
  uiState: any
  setUiState: any
}

const WidgetUiStateProvider = (props: WidgetUiStateProviderProps) => {
  var { uiState: rootUiState, setUiState: setRootUiState } = useInstantSearch()

  const handleStateChange = (props: StateChangeHandleProps) => {
    props.setUiState(props.uiState)
    setRootUiState(props.uiState)
  }

  return (
    <InstantSearch
      indexName={props.indexName}
      searchClient={searchClient}
      onStateChange={handleStateChange}
      initialUiState={rootUiState}
    >
      {props.children}
    </InstantSearch>
  )
}

interface VirtualRefinementProps {
  attribute: string
}

const VirtualRefinementList = (props: VirtualRefinementProps) => {
  let { attribute } = props
  useRefinementList({ attribute })
  const { items: currentRefinements } = useCurrentRefinements({
    includedAttributes: [attribute],
  })

  const refinements = currentRefinements?.[0]?.refinements || []

  return (
    <div>
      {refinements.map((item) => (
        <div key={item.label}></div>
      ))}
    </div>
  )
}

interface CustomRefinementListProps extends UseRefinementListProps {
  Header: string
  Visible: boolean
}

function RefinementList(props: CustomRefinementListProps) {
  const { items, refine } = useRefinementList(props)
  const { Header, Visible } = props

  const { items: currentRefinements } = useCurrentRefinements({
    includedAttributes: [props.attribute],
  })

  const refinements = currentRefinements?.[0]?.refinements || []
  console.log(refinements)

  return (
    <Box>
      <Divider
        textAlign="left"
        sx={{
          borderBottomWidth: 3,
          borderColor: "black",
        }}
      >
        <Typography>{Header}</Typography>
      </Divider>
      {items.map((item) => {
        return (
          <Chip
            // key={item.value}
            label={
              <Typography
                variant="body2"
                sx={{
                  fontSize: 10,
                }}
              >{`${item.label} (${item.count})`}</Typography>
            }
            sx={{
              margin: 0.2,
              "&:focus": {
                backgroundColor: "none",
              },
            }}
            onClick={() => {
              console.log("yo")
              refine(item.value)
            }}
            variant={item.isRefined ? "filled" : "outlined"}
          />
        )
      })}
    </Box>
  )
}

interface CustomSearchBoxProps extends UseSearchBoxProps {
  showFilters: boolean
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>
}

function SearchBox(props: CustomSearchBoxProps) {
  const { refine } = useSearchBox(props)
  const { showFilters, setShowFilters } = props

  return (
    <TextField
      autoFocus
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton
              aria-label="search icon"
              // onClick={handleClickShowPassword}
              // onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowFilters(!showFilters)}
              // onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              <FilterAltIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{ fontSize: "50px" }}
      placeholder="Find your next adventure"
      variant="standard"
      onChange={(e) => refine(e.target.value)}
    />
  )
}

const searchClient = algoliasearch(
  "4O74OKDYWE",
  "e508bec42386a3e08f60485a600a8371",
)

const Component = () => {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <InstantSearch searchClient={searchClient} indexName="entities">
      <VirtualRefinementList attribute="State" />
      <VirtualRefinementList attribute="CampMethods" />
      <VirtualRefinementList attribute="Activities" />
      <Box sx={{ width: "100%" }}>
        <Container
          component="main"
          maxWidth="md"
          sx={{
            display: "flex",
            flexDirection: "column",
            margin: "#222222",
            "& .MuiTextField-root": { width: "100%" },
          }}
        >
          <SearchBox
            setShowFilters={setShowFilters}
            showFilters={showFilters}
          />
        </Container>
      </Box>
      <Container
        component="main"
        maxWidth="md"
        sx={{
          width: "100%",
          paddingTop: 2,
          paddingBottom: 2,
          "& .MuiTextField-root": { width: "100%" },
        }}
      >
        {showFilters && (
          <WidgetUiStateProvider
            searchClient={searchClient}
            indexName="entities"
          >
            <Grid container>
              <Grid item xs={12}>
                <RefinementList
                  attribute="State"
                  Header="State"
                  Visible={showFilters}
                />
              </Grid>
              <Grid item xs={12}>
                <RefinementList
                  attribute="CampMethods"
                  Header="Ways to camp"
                  Visible={showFilters}
                />
              </Grid>
              <Grid item xs={12}>
                <RefinementList
                  attribute="Activities"
                  Header="Activities"
                  Visible={showFilters}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider
                  sx={{
                    marginTop: 1,
                    borderBottomWidth: 2,
                    borderColor: "black",
                  }}
                />
              </Grid>
            </Grid>
          </WidgetUiStateProvider>
        )}
        <Grid item xs={12} sx={{ marginTop: 0 }}>
          <Hits />
        </Grid>
      </Container>
    </InstantSearch>
  )
}

export default Component

export interface HighlightResult {
  value: string
  matchLevel: string
  fullyHighlighted: boolean
  matchedWords: string[]
}

export interface Hit {
  objectID: string
  Name: string
  AreaName: string
  Country: string
  City: string
  State: string
  ImageURL: string
  Rating: number
  NumberOfRatings: number
  CampMethods: string[]
  Activities: string[]
  _highlightResult: { [field: string]: HighlightResult | HighlightResult[] }
  __position: number
}

const columns: GridColDef[] = [
  {
    field: "Name",
    headerName: "Campground",
    flex: 3,
    valueGetter: (params) => {
      let hit: Hit = params.row
      return hit
    },
    renderCell: ({ value }) => {
      let hit: Hit = value as Hit
      // triggered
      let Name: HighlightResult = hit._highlightResult.Name as unknown as any
      let AreaName: HighlightResult = hit._highlightResult
        .AreaName as unknown as any
      let State: HighlightResult = hit._highlightResult.State as unknown as any
      let City: HighlightResult = hit._highlightResult.City as unknown as any
      let CampMethods: HighlightResult[] = hit._highlightResult
        .CampMethods as unknown as any

      return (
        <Container
          component="main"
          maxWidth="sm"
          sx={{
            width: "100%",
            padding: 0,

            "& .MuiTextField-root": { width: "100%" },
          }}
        >
          <Grid container>
            <Grid item xs={12}>
              <Typography
                noWrap
                variant="body1"
                dangerouslySetInnerHTML={{
                  __html: Name.value,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                noWrap
                variant="body2"
                dangerouslySetInnerHTML={{
                  __html: AreaName.value,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                noWrap
                variant="body2"
                dangerouslySetInnerHTML={{
                  __html: `${State.value}, ${City.value}`,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                sx={{
                  fontSize: 8,
                  display: "inline-block",
                  whiteSpace: "pre-line",
                }}
                noWrap
                dangerouslySetInnerHTML={{
                  __html:
                    CampMethods &&
                    CampMethods.map((result) => result.value).join(", "),
                }}
              />
            </Grid>
          </Grid>
        </Container>
      )
    },
  },
  {
    field: "Rating",
    headerName: "Rating",
    flex: 1,
    align: "right",
    valueGetter: (params) => {
      let hit: Hit = params.row
      return hit
    },
    renderCell: ({ value }) => (
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          width: "100%",
          padding: 0,
          "& .MuiTextField-root": { width: "100%" },
        }}
      >
        <Grid container justifyContent="flex-end">
          <Grid item xs={9}>
            <Typography
              align="right"
              noWrap
              variant="body1"
              sx={{ marginRight: 0.2 }}
              dangerouslySetInnerHTML={{
                __html: `${value.Rating.toFixed(2)}`,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <GradeIcon sx={{ fontSize: "20px" }} />
          </Grid>
          <Grid item xs={9}>
            <Typography
              align="right"
              noWrap
              variant="body2"
              sx={{ marginRight: 0.2 }}
              dangerouslySetInnerHTML={{
                __html: value.NumberOfRatings,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <PeopleOutlineIcon sx={{ fontSize: "20px" }} />
          </Grid>
        </Grid>
      </Container>
    ),
  },

  // {
  //   field: "Name",
  //   headerName: "Campground",
  //   valueGetter: (params) => {
  //     let hit: Hit = params.row
  //     return hit.ImageURL
  //   },
  //   renderCell: ({ value }) => (
  //     <Box
  //       component="img"
  //       sx={{
  //         height: 233,
  //         width: 350,
  //       }}
  //       alt="The house from the offer."
  //       src={value}
  //     />
  //   ),
  // },
  // {
  //   field: "Name",
  //   headerName: "Campground",
  //   flex: 1,
  //   valueGetter: (params) => {
  //     let hit: Hit = params.row
  //     return hit._highlightResult.Name.value
  //   },
  //   renderCell: ({ value }) => (
  //     <Typography
  //       variant="body2"
  //       dangerouslySetInnerHTML={{
  //         __html: value,
  //       }}
  //     />
  //   ),
  // },
]

function CustomNoRowsOverlay() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      No campgrounds meet your exacting requirements.
    </Box>
  )
}
