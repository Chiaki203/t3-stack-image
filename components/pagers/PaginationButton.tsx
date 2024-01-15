'use client'

import { useTransition, useCallback, useMemo } from 'react'
import { Button } from '../ui/button'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import {
  usePathname,
  useRouter,
  useSearchParams,
  useParams,
} from 'next/navigation'

interface PaginationButtonProps {
  pageCount: number
  displayPerPage: number
}

const PaginationButton = ({
  pageCount,
  displayPerPage,
}: PaginationButtonProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const page = searchParams?.get('page') ?? '1'
  const perPage = searchParams?.get('perPage') ?? displayPerPage.toString()
  const siblingCount = 1

  console.log('isPending', isPending)

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      console.log('searchParams', searchParams)
      console.log('searchParams.toString()', searchParams?.toString())
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      console.log(
        'newSearchParams - new URLSearchParams(searchParams?.toString())',
        newSearchParams
      )
      console.log('params', params)
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }
      console.log('newSearchParams.toString()', newSearchParams.toString())
      return newSearchParams.toString()
    },
    [searchParams]
  )

  const paginationRange = useMemo(() => {
    const currentPage = Number(page)
    console.log('currentPage', currentPage)
    console.log('pageCount', pageCount)
    console.log('perPage', perPage)
    const range = []
    for (
      let i = Math.max(2, currentPage - siblingCount);
      i <= Math.min(pageCount - 1, currentPage + siblingCount);
      i++
    ) {
      range.push(i)
    }
    console.log('range1', range)
    if (currentPage - siblingCount > 2) {
      range.unshift('...')
    }
    console.log('range2', range)
    if (currentPage + siblingCount < pageCount - 1) {
      range.push('...')
    }
    console.log('range3', range)
    range.unshift(1)
    console.log('range4', range)
    if (pageCount !== 1) {
      range.push(pageCount)
    }
    console.log('range5', range)
    return range
  }, [page, pageCount, siblingCount])

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pb-10">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          startTransition(() => {
            router.push(
              `${pathname}?${createQueryString({
                page: 1,
                perPage: perPage ?? null,
              })}`
            )
          })
        }}
        disabled={Number(page) === 1 || isPending}
      >
        <DoubleArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">First Page</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          startTransition(() => {
            router.push(
              `${pathname}?${createQueryString({
                page: Number(page) - 1,
                perPage: perPage ?? null,
              })}`
            )
          })
        }}
        disabled={Number(page) === 1 || isPending}
      >
        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Previous Page</span>
      </Button>
      {paginationRange.map((pageNumber, i) =>
        pageNumber === '...' ? (
          <Button
            key={i}
            aria-label="Page separator"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled
          >
            ...
          </Button>
        ) : (
          <Button
            key={i}
            aria-label={`Page ${pageNumber}`}
            variant={Number(page) === pageNumber ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              startTransition(() => {
                router.push(
                  `${pathname}?${createQueryString({
                    page: pageNumber,
                    perPage: perPage ?? null,
                  })}`
                )
              })
            }}
            disabled={isPending}
          >
            {pageNumber}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          startTransition(() => {
            router.push(
              `${pathname}?${createQueryString({
                page: Number(page) + 1,
                perPage: perPage ?? null,
              })}`
            )
          })
        }}
        disabled={Number(page) === (pageCount ?? 10) || isPending}
      >
        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Next Page</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          router.push(
            `${pathname}?${createQueryString({
              page: pageCount ?? 10,
              perPage: perPage ?? null,
            })}`
          )
        }}
        disabled={Number(page) === (pageCount ?? 10) || isPending}
      >
        <DoubleArrowRightIcon className="hh-5 w-5" aria-hidden="true" />
        <span className="sr-only">Last Page</span>
      </Button>
    </div>
  )
}

export default PaginationButton
