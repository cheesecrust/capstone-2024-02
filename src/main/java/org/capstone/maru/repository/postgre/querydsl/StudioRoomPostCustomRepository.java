package org.capstone.maru.repository.postgre.querydsl;

import io.lettuce.core.Value;
import jakarta.annotation.Nonnull;
import org.capstone.maru.domain.StudioRoomPost;
import org.capstone.maru.dto.StudioRoomRecommendPost;
import org.capstone.maru.dto.request.SearchFilterRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StudioRoomPostCustomRepository {

    Page<StudioRoomPost> findStudioRoomPostByDynamicFilter(
        String gender,
        @Nonnull SearchFilterRequest searchFilterRequest,
        String searchKeyWords,
        Pageable pageable
    );

    Page<StudioRoomPost> findStudioRoomPostBySearchKeyWords(
        String gender,
        String searchKeyWords,
        Pageable pageable
    );

    Page<StudioRoomRecommendPost> findStudioRoomPostByRecommendDynamicFilter(
        String gender,
        @Nonnull SearchFilterRequest searchFilterRequest,
        String searchKeyWords,
        String memberId,
        String cardOption,
        Pageable pageable
    );

    Page<StudioRoomRecommendPost> findStudioRoomRecommendPostBySearchKeyWords(
        String memberId,
        String gender,
        String searchKeyWords,
        String cardOption,
        Pageable pageable
    );

    Page<StudioRoomRecommendPost> findAllRecommendByPublisherGender(
        String gender,
        String cardOption,
        Pageable pageable
    );
}
