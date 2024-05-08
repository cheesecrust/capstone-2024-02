import { useMutation, useQuery } from '@tanstack/react-query';
import { type AxiosResponse } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createSharedPost,
  deleteDormitorySharedPost,
  deleteSharedPost,
  getDormitorySharedPost,
  getDormitorySharedPosts,
  getSharedPost,
  getSharedPosts,
  scrapDormitoryPost,
  scrapPost,
} from './shared.api';
import {
  type ImageFile,
  type CreateSharedPostProps,
  type GetSharedPostsProps,
  type SelectedExtraOptions,
  type SelectedOptions,
} from './shared.type';

import { useAuthValue } from '@/features/auth';
import { type NaverAddress } from '@/features/geocoding';
import { useDebounce } from '@/shared/debounce';
import { type FailureDTO, type SuccessBaseDTO } from '@/shared/types';

export const usePaging = ({
  totalPages,
  sliceSize,
}: {
  totalPages: number;
  sliceSize: number;
}) => {
  const [page, setPage] = useState(1);

  const currentSlice = useMemo(
    () => Math.floor((page - 1) / sliceSize),
    [page, sliceSize],
  );
  const sliceCount = useMemo(
    () => Math.floor(totalPages / sliceSize),
    [totalPages, sliceSize],
  );

  const isFirstPage = useMemo(() => page === 1, [page]);
  const isLastPage = useMemo(() => page === totalPages, [page, totalPages]);

  const handleSetPage = useCallback(
    (newPage: number) => {
      if (page < 0 || page > totalPages) return;
      setPage(newPage);
    },
    [page, totalPages],
  );

  const handleNextPage = useCallback(() => {
    if (isLastPage) return;
    setPage(prev => prev + 1);
  }, [isLastPage, setPage]);

  const handlePrevPage = useCallback(() => {
    if (isFirstPage) return;
    setPage(prev => prev - 1);
  }, [isFirstPage, setPage]);

  return useMemo(
    () => ({
      page,
      totalPages,
      sliceSize,
      currentSlice,
      sliceCount,
      isFirstPage,
      isLastPage,
      handleSetPage,
      handleNextPage,
      handlePrevPage,
    }),
    [
      page,
      totalPages,
      sliceSize,
      currentSlice,
      sliceCount,
      isFirstPage,
      isLastPage,
      handleSetPage,
      handleNextPage,
      handlePrevPage,
    ],
  );
};

export const useCreateSharedPostProps = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [address, setAddress] = useState<NaverAddress | null>(null);

  const [mateLimit, setMateLimit] = useState(0);
  const [expectedMonthlyFee, setExpectedMonthlyFee] = useState<number>(0);

  const [houseSize, setHouseSize] = useState<number>(0);
  const [selectedExtraOptions, setSelectedExtraOptions] =
    useState<SelectedExtraOptions>({});
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

  const handleExtraOptionClick = useCallback((option: string) => {
    setSelectedExtraOptions(prevSelectedOptions => ({
      ...prevSelectedOptions,
      [option]: !prevSelectedOptions[option],
    }));
  }, []);

  const handleOptionClick = useCallback(
    (optionName: keyof SelectedOptions, item: string) => {
      setSelectedOptions(prevState => ({
        ...prevState,
        [optionName]: prevState[optionName] === item ? null : item,
      }));
    },
    [],
  );

  const isOptionSelected = useCallback(
    (optionName: keyof SelectedOptions, item: string) =>
      selectedOptions[optionName] === item,
    [selectedOptions],
  );

  const isExtraOptionSelected = useCallback(
    (item: string) => selectedExtraOptions[item],
    [selectedExtraOptions],
  );

  const isPostCreatable = useMemo(
    () =>
      images.length > 0 &&
      title.trim().length > 0 &&
      content.trim().length > 0 &&
      selectedOptions.budget != null &&
      expectedMonthlyFee > 0 &&
      selectedOptions.roomType != null &&
      houseSize > 0 &&
      selectedOptions.roomCount != null &&
      selectedOptions.restRoomCount != null &&
      selectedOptions.livingRoom != null &&
      mateLimit > 0 &&
      address != null,
    [
      images,
      title,
      content,
      selectedOptions,
      expectedMonthlyFee,
      houseSize,
      mateLimit,
      address,
    ],
  );

  return useMemo(
    () => ({
      title,
      setTitle,
      content,
      setContent,
      images,
      setImages,
      address,
      setAddress,
      mateLimit,
      setMateLimit,
      expectedMonthlyFee,
      setExpectedMonthlyFee,
      houseSize,
      setHouseSize,
      selectedExtraOptions,
      setSelectedExtraOptions,
      selectedOptions,
      setSelectedOptions,
      handleOptionClick,
      handleExtraOptionClick,
      isOptionSelected,
      isExtraOptionSelected,
      isPostCreatable,
    }),
    [
      title,
      setTitle,
      content,
      setContent,
      images,
      setImages,
      address,
      setAddress,
      mateLimit,
      setMateLimit,
      expectedMonthlyFee,
      setExpectedMonthlyFee,
      houseSize,
      setHouseSize,
      selectedExtraOptions,
      setSelectedExtraOptions,
      selectedOptions,
      setSelectedOptions,
      handleOptionClick,
      handleExtraOptionClick,
      isOptionSelected,
      isExtraOptionSelected,
      isPostCreatable,
    ],
  );
};

export const usePostMateCardInputSection = () => {
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [birthYear, setBirthYear] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [mbti, setMbti] = useState<string | undefined>(undefined);
  const [major, setMajor] = useState<string | undefined>(undefined);
  const [budget, setBudget] = useState<string | undefined>(undefined);

  const [features, setFeatures] = useState<{
    smoking?: string;
    roomSharingOption?: string;
    mateAge?: number;
    options: Set<string>;
  }>({ options: new Set() });

  const handleEssentialFeatureChange = useCallback(
    (
      key: 'smoking' | 'roomSharingOption' | 'mateAge',
      value: string | number | undefined,
    ) => {
      setFeatures(prev => {
        if (prev[key] === value) {
          const newFeatures = { ...prev };
          newFeatures[key] = undefined;
          return newFeatures;
        }
        return { ...prev, [key]: value };
      });
    },
    [],
  );

  const handleOptionalFeatureChange = useCallback((option: string) => {
    setFeatures(prev => {
      const { options } = prev;
      const newOptions = new Set(options);

      if (options.has(option)) newOptions.delete(option);
      else newOptions.add(option);

      return { ...prev, options: newOptions };
    });
  }, []);

  const derivedFeatures = useMemo(() => {
    const options: string[] = [];
    features.options.forEach(option => options.push(option));

    return {
      smoking: features?.smoking ?? '상관없어요',
      roomSharingOption: features?.roomSharingOption ?? '상관없어요',
      mateAge: birthYear,
      options: JSON.stringify(options),
    };
  }, [features, birthYear]);

  const auth = useAuthValue();
  useEffect(() => {
    if (auth?.user != null) {
      setGender(auth.user.gender);
    }
  }, [auth?.user]);

  const isMateCardCreatable = useMemo(
    () =>
      gender != null && birthYear != null && location != null && budget != null,
    [gender, birthYear, location, budget],
  );

  return useMemo(
    () => ({
      gender,
      setGender,
      birthYear,
      setBirthYear,
      location,
      setLocation,
      mbti,
      setMbti,
      major,
      setMajor,
      budget,
      setBudget,
      derivedFeatures,
      handleEssentialFeatureChange,
      handleOptionalFeatureChange,
      isMateCardCreatable,
    }),
    [
      gender,
      setGender,
      birthYear,
      setBirthYear,
      location,
      setLocation,
      mbti,
      setMbti,
      major,
      setMajor,
      budget,
      setBudget,
      derivedFeatures,
      handleEssentialFeatureChange,
      handleOptionalFeatureChange,
      isMateCardCreatable,
    ],
  );
};

export const useCreateSharedPost = () =>
  useMutation<AxiosResponse<SuccessBaseDTO>, FailureDTO, CreateSharedPostProps>(
    {
      mutationFn: createSharedPost,
    },
  );

export const useSharedPosts = ({
  filter,
  search,
  page,
  enabled,
}: GetSharedPostsProps & { enabled: boolean }) => {
  const debounceFilter = useDebounce(filter, 1000);

  return useQuery({
    queryKey: ['/api/shared/posts/studio', { debounceFilter, search, page }],
    queryFn: async () =>
      await getSharedPosts({ filter: debounceFilter, search, page }).then(
        response => response.data,
      ),
    staleTime: 60000,
    enabled,
  });
};

export const useSharedPost = ({
  postId,
  enabled,
}: {
  postId: number;
  enabled: boolean;
}) =>
  useQuery({
    queryKey: [`/api/shared/posts/studio/${postId}`],
    queryFn: async () =>
      await getSharedPost(postId).then(response => response.data),
    enabled,
  });

export const useDeleteSharedPost = ({
  postId,
  onSuccess,
  onError,
}: {
  postId: number;
  onSuccess: (data: SuccessBaseDTO) => void;
  onError: (error: Error) => void;
}) =>
  useMutation({
    mutationFn: async () =>
      await deleteSharedPost(postId).then(response => response.data),
    onSuccess,
    onError,
  });

export const useScrapSharedPost = () =>
  useMutation<AxiosResponse<SuccessBaseDTO>, FailureDTO, number>({
    mutationFn: scrapPost,
  });

export const useDormitorySharedPosts = ({
  filter,
  search,
  page,
  enabled,
}: GetSharedPostsProps & { enabled: boolean }) =>
  useQuery({
    queryKey: ['/api/shared/posts/dormitory', { filter, search, page }],
    queryFn: async () =>
      await getDormitorySharedPosts({ filter, search, page }).then(
        response => response.data,
      ),
    staleTime: 60000,
    enabled,
  });

export const useDormitorySharedPost = ({
  postId,
  enabled,
}: {
  postId: number;
  enabled: boolean;
}) =>
  useQuery({
    queryKey: [`/api/shared/posts/dormitory/${postId}`],
    queryFn: async () =>
      await getDormitorySharedPost(postId).then(response => response.data),
    enabled,
  });

export const useDeleteDormitorySharedPost = ({
  postId,
  onSuccess,
  onError,
}: {
  postId: number;
  onSuccess: (data: SuccessBaseDTO) => void;
  onError: (error: Error) => void;
}) =>
  useMutation({
    mutationFn: async () =>
      await deleteDormitorySharedPost(postId).then(response => response.data),
    onSuccess,
    onError,
  });

export const useScrapDormitorySharedPost = () =>
  useMutation<AxiosResponse<SuccessBaseDTO>, FailureDTO, number>({
    mutationFn: scrapDormitoryPost,
  });
