package com.wudong.repository;

import com.wudong.entity.TravelRoute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelRouteRepository extends JpaRepository<TravelRoute, Long> {

    Page<TravelRoute> findByStatusTrue(Pageable pageable);

    @Query("SELECT tr FROM TravelRoute tr WHERE tr.status = true AND (tr.title LIKE %:keyword% OR tr.themeTags LIKE %:keyword%)")
    Page<TravelRoute> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT tr FROM TravelRoute tr WHERE tr.status = true AND tr.themeTags LIKE %:theme%")
    Page<TravelRoute> findByTheme(@Param("theme") String theme, Pageable pageable);
}
