from sqlalchemy import delete
from app.core.database import SessionLocal
from app.models.venue import Venue
from app.models.concert import Concert
from app.models.assocations import concert_performers

def cleanup_test_data():
    db = SessionLocal()
    try:
        # 1. Identify test venues
        test_patterns = ['-', '_', 'Test', 'Delete Venue']
        venues = db.query(Venue).all()
        test_venue_ids = [v.id for v in venues if any(p in v.name for p in test_patterns)]
        
        if not test_venue_ids:
            print("No test data found to cleanup.")
            return

        # 2. Identify concerts linked to these venues
        test_concert_ids = [c.id for c in db.query(Concert).filter(Concert.venue_id.in_(test_venue_ids)).all()]
        
        print(f"Found {len(test_venue_ids)} test venues and {len(test_concert_ids)} linked concerts.")

        # 3. Delete from M2M table first
        if test_concert_ids:
            db.execute(delete(concert_performers).where(concert_performers.c.concert_id.in_(test_concert_ids)))
            # 4. Delete concerts
            db.execute(delete(Concert).where(Concert.id.in_(test_concert_ids)))
        
        # 5. Finally delete venues
        db.execute(delete(Venue).where(Venue.id.in_(test_venue_ids)))
        
        db.commit()
        print("Cleanup complete.")
            
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_test_data()
