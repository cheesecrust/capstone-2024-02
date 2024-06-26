package org.capstone.maru.repository.postgre;

import java.util.Optional;
import org.capstone.maru.domain.StudioRoomPost;
import org.capstone.maru.repository.postgre.querydsl.StudioRoomPostCustomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudioRoomPostRepository extends
    JpaRepository<StudioRoomPost, Long>,
    StudioRoomPostCustomRepository {

    Page<StudioRoomPost> findAllByPublisherGender(String gender, Pageable pageable);

    Optional<StudioRoomPost> findByIdAndPublisherGender(Long postId, String gender);

    Optional<StudioRoomPost> findByIdAndPublisherAccount_MemberId(Long postId, String memberId);

    void deleteByIdAndPublisherAccount_MemberId(Long postId, String memberId);
}
