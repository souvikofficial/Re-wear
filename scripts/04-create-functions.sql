-- Function to increment user points
CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET points = points + increment_user_points.points 
  WHERE id = increment_user_points.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_id UUID,
  notification_type TEXT,
  related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, related_id)
  VALUES (user_id, notification_type, related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for swap notifications
CREATE OR REPLACE FUNCTION notify_swap_events()
RETURNS TRIGGER AS $$
DECLARE
  item_owner_id UUID;
BEGIN
  -- Get the item owner
  SELECT owner_id INTO item_owner_id 
  FROM items 
  WHERE id = NEW.item_id;
  
  -- Create notification for item owner when swap is requested
  IF TG_OP = 'INSERT' AND NEW.status = 'requested' THEN
    PERFORM create_notification(
      item_owner_id,
      'swap_requested',
      NEW.id
    );
  END IF;
  
  -- Create notification for requester when swap status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM create_notification(
      NEW.requester_id,
      'swap_' || NEW.status,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for swap notifications
DROP TRIGGER IF EXISTS swap_notification_trigger ON swaps;
CREATE TRIGGER swap_notification_trigger
  AFTER INSERT OR UPDATE ON swaps
  FOR EACH ROW
  EXECUTE FUNCTION notify_swap_events();
