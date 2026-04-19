from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models import Venue, Performer, Concert, Province

def seed_data():
    db = SessionLocal()
    try:
        if db.query(Venue).first():
            print("✨ Database contains data. Use 'docker compose down -v' for a hard reset if needed.")
            return

        print("🌱 Growing the concert database...")

        venues = {
            "ab": Venue(
                name="Ancienne Belgique", 
                city="Brussels", 
                province=Province.FLEMISH_BRABANT, 
                address="Anspachlaan 110", 
                website_url="https://www.abconcerts.be/en/agenda",
                scraper_config={
                    "selectors": {
                        "card": ".content-card__list__row",
                        "title": ".content-card__title",
                        "date": ".content-card__media__label",
                        "url": "a"
                    },
                    "date_parsing": {
                        "type": "format",
                        "format": "%a %d %b"
                    },
                    "performer_strategy": {
                        "split_by": [" + ", " & ", " / "]
                    }
                }
            ),
            "trix": Venue(
                name="Trix", 
                city="Antwerp", 
                province=Province.ANTWERP, 
                address="Noordersingel 28", 
                website_url="https://www.trixonline.be/en/program/",
                scraper_config={
                    "selectors": {
                        "card": ".program-list__item",
                        "title": ".program-list__artist",
                        "date": "time",
                        "url": "self"
                    },
                    "date_parsing": {
                        "type": "format",
                        "format": "%Y-%m-%d",
                        "attr": "datetime"
                    },
                    "performer_strategy": {
                        "split_by": [" + ", " / "]
                    }
                }
            ),
            "vooruit": Venue(name="VIERNULVIER (Vooruit)", city="Ghent", province=Province.EAST_FLANDERS, 
                             address="Sint-Pietersnieuwstraat 23", website_url="https://www.viernulvier.gent"),
            "cactus": Venue(name="Cactus Club", city="Bruges", province=Province.WEST_FLANDERS, 
                            address="Bargeweg 10", website_url="https://www.cactusmusic.be"),
            "muziekodroom": Venue(name="Muziekodroom", city="Hasselt", province=Province.LIMBURG, 
                                  address="Bootstraat 9", website_url="https://www.muziekodroom.be"),
            "depot": Venue(name="Het Depot", city="Leuven", province=Province.FLEMISH_BRABANT, 
                           address="Martelarenplein 12", website_url="https://www.hetdepot.be")
        }
        db.add_all(venues.values())
        db.flush() 

        performers = {
            "amenra": Performer(name="Amenra"),
            "brutus": Performer(name="Brutus"),
            "stake": Performer(name="STAKE"),
            "whispering": Performer(name="Whispering Sons"),
            "goose": Performer(name="Goose"),
            "zwangere": Performer(name="Zwangere Guy"),
            "balthazar": Performer(name="Balthazar")
        }
        db.add_all(performers.values())
        db.flush()

        concerts = [
            Concert(
                title="Brutus + Amenra: Loud Night",
                date=datetime.now() + timedelta(days=45),
                price=42.50, # In $
                venue=venues["trix"],
                performers=[performers["brutus"], performers["amenra"]],
                content_hash="hash_trix_001"
            ),
            Concert(
                title="Balthazar - Sand Tour",
                date=datetime.now() + timedelta(days=12),
                price=38.00,
                venue=venues["vooruit"],
                performers=[performers["balthazar"]],
                content_hash="hash_vooruit_002"
            ),
            Concert(
                title="Zwangere Guy Live",
                date=datetime.now() + timedelta(days=5),
                price=30.00,
                venue=venues["ab"],
                performers=[performers["zwangere"]],
                content_hash="hash_ab_003"
            ),
            Concert(
                title="Whispering Sons - Exclusive Club Show",
                date=datetime.now() + timedelta(days=20),
                price=25.50,
                venue=venues["depot"],
                performers=[performers["whispering"]],
                content_hash="hash_depot_004"
            )
        ]
        
        db.add_all(concerts)
        db.commit()
        print(f"✅ Seeding complete! Added {len(venues)} venues, {len(performers)} performers and {len(concerts)} concerts.")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()